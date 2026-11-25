/**
 * @file    role-assignment.service.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Who holds a role. In plain words: shows a role with its people and what it allows, and gives a role to users in the session company. Kept apart from `RolesService` because it must clear a user's cached rights through the port (decision L-30).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/services/role-assignment.service.ts
 * @lld-synced     v0.19
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { AuditService } from '@libs/audit';
import { ForbiddenAppException, NotFoundAppException } from '@libs/common';
import { RoleStatus } from '@libs/database';
import { UserCompanyRoleRepository } from '@libs/organisation';
import { UserRepository } from '@libs/users';
import { RoleInactiveException } from '../errors/role-inactive.exception';
import { UserNotFoundException } from '../errors/user-not-found.exception';
import { PermissionCacheInvalidator } from '../ports/permission-cache-invalidator';
import { RoleRecord, RoleRepository } from '../repositories/role';
import { RolePermissionRepository } from '../repositories/role-permission';

/** One person who holds the role. */
export interface RoleHolder {
  employeeCode: string;
  name: string;
  department: string | null;
  company: string;
  assignedOn: Date;
}

/** A role with its people and what it allows. */
export interface RoleDetails {
  role: RoleRecord;
  users: RoleHolder[];
  allows: Array<{ permission: string; scope: 'OWN' | 'DEPARTMENT' | 'COMPANY' | null }>;
}

/** The input of an assignment. */
export interface AssignInput {
  roleId: string;
  employeeCodes: string[];
  companyCode: string;
  validFrom: Date;
  reason: string;
}

/**
 * Role assignment service.
 *
 * In plain words: the rules of giving a role to users and of showing who holds it.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-05, API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.19 §6.4
 */
/** The start of today in UTC, the way the date columns are compared. */
const startOfToday = (): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

@Injectable()
export class RoleAssignmentService {
  constructor(
    private readonly roles: RoleRepository,
    private readonly cells: RolePermissionRepository,
    private readonly holders: UserCompanyRoleRepository,
    private readonly users: UserRepository,
    private readonly cache: PermissionCacheInvalidator,
    private readonly audit: AuditService,
  ) {}

  /**
   * Shows a role with its people.
   *
   * In plain words: the role, the users who hold it by company with the day they got it, and what the role allows.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-011
 * @subtask   ST-ADM01-011-BE-02
 * @frd       FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-05
 * @ac        AC-US011-02
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.4
 * @status    built
   *
   * @dependencies RoleRepository.findById, UserCompanyRoleRepository.listByRole, RolePermissionRepository.listForRole
   *
   * @param roleId - the role
   * @param companyCode - one company, or null for every company (decision L-33)
   * @returns The role details
   * @throws NotFoundAppException - no such role (HTTP 404, ROLE_NOT_FOUND)
   */
  async getDetails(roleId: string, companyCode: string | null): Promise<RoleDetails> {
    const role = await this.roles.findById(roleId);
    if (!role) throw new NotFoundAppException('ROLE_NOT_FOUND', 'No such role');
    const rows = await this.holders.listByRole(roleId, companyCode, startOfToday());
    const users = rows.map((r) => ({ employeeCode: r.employeeCode, name: r.fullName, department: r.departmentName, company: r.companyCode, assignedOn: r.assignedOn }));
    const allows = (await this.cells.listForRole(roleId)).filter((c) => c.allowed).map((c) => ({ permission: c.key, scope: c.scope }));
    return { role, users, allows };
  }

  /**
   * Gives a role to users.
   *
   * In plain words: checks the role and the users, saves the assignments that do not exist yet, clears the cached rights of each user, and records it in the audit trail.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-011
 * @subtask   ST-ADM01-011-BE-02
 * @frd       FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-06
 * @ac        AC-US011-01, AC-US011-03
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.4
 * @status    built
   *
   * @dependencies RoleRepository.findById, UserRepository.findByCodes, UserCompanyRoleRepository.findHolders, insertMany, PermissionCacheInvalidator.clearUser, AuditService.recordChange
   *
   * @param input - role, employee codes, company, first day and reason
   * @param sessionCompany - the company of the signed-in user
   * @param actor - user key of the caller (audit)
   * @param assignedBy - employee code of the caller (assignment row)
   * @returns `assigned`: how many new rows were written
   * @throws NotFoundAppException - no such role (HTTP 404, ROLE_NOT_FOUND)
   * @throws RoleInactiveException - the role is not Active (HTTP 422)
   * @throws ForbiddenAppException - the company is not the session company (HTTP 403, COMPANY_MISMATCH)
   * @throws UserNotFoundException - an unknown or Inactive user; all are named (HTTP 404)
   */
  async assignUsers(input: AssignInput, sessionCompany: string, actor: string, assignedBy: string): Promise<{ assigned: number }> {
    const role = await this.roles.findById(input.roleId);
    if (!role) throw new NotFoundAppException('ROLE_NOT_FOUND', 'No such role');
    if (role.status !== RoleStatus.ACTIVE) throw new RoleInactiveException();
    if (input.companyCode !== sessionCompany) throw new ForbiddenAppException('COMPANY_MISMATCH', 'You can give a role only in your own company');
    const found = await this.users.findByCodes(input.employeeCodes);
    const good = found.filter((u) => u.status === 'ACTIVE');
    const missing = input.employeeCodes.filter((c) => !good.some((u) => u.employeeCode === c));
    if (missing.length > 0) throw new UserNotFoundException(missing);
    const already = new Set(await this.holders.findHolders(input.roleId, input.companyCode, good.map((u) => u.id), input.validFrom));
    const fresh = good.filter((u) => !already.has(u.id));
    if (fresh.length === 0) return { assigned: 0 };
    const rows = fresh.map((u) => ({ userId: u.id, roleId: input.roleId, companyCode: input.companyCode, validFrom: input.validFrom, assignedBy }));
    const assigned = await this.holders.insertMany(rows);
    for (const u of fresh) await this.cache.clearUser(u.id);
    const after = { companyCode: input.companyCode, validFrom: input.validFrom.toISOString().slice(0, 10), employeeCodes: fresh.map((u) => u.employeeCode) };
    await this.audit.recordChange({ actor, entity: 'Role', entityKey: input.roleId, after, reason: input.reason });
    return { assigned };
  }
}
