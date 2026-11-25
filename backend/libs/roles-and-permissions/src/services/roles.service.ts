/**
 * @file    roles.service.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Role business rules. In plain words: lists roles, creates and changes them, and deactivates a role nobody holds.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.17 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.17.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/services/roles.service.ts
 * @lld-synced     v0.17
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { AuditService } from '@libs/audit';
import { NotFoundAppException } from '@libs/common';
import { RoleStatus } from '@libs/database';
import { RoleCellInput, RoleFields, RoleFilter, RoleRecord, RoleRepository } from '../repositories/role';
import { RolePermissionRepository } from '../repositories/role-permission';
import { ADMINISTRATOR_ROLE_CODE, PROTECTED_RIGHTS } from '../constants/protected-rights';
import { RoleInUseException } from '../errors/role-in-use.exception';
import { RoleLockedException } from '../errors/role-locked.exception';
import { RoleNameExistsException } from '../errors/role-name-exists.exception';

/**
 * Roles service.
 *
 * In plain words: the rules of roles; the controller only passes the request in and the answer out.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-01 to API-ROL-04
 *   lld:       LLD-EPIC-ADM-01 v0.17 §6.4
 */
const snapshot = (r: RoleRecord): Record<string, unknown> => ({ name: r.name, description: r.description, status: r.status });

@Injectable()
export class RolesService {
  constructor(
    private readonly roles: RoleRepository,
    private readonly cells: RolePermissionRepository,
    private readonly audit: AuditService,
  ) {}

  /** Throws ROLE_NOT_FOUND when there is no such role. */
  private async mustFind(roleId: string): Promise<RoleRecord> {
    const role = await this.roles.findById(roleId);
    if (!role) throw new NotFoundAppException('ROLE_NOT_FOUND', 'No such role');
    return role;
  }

  /** The Administrator role: locked rights, no rename, no deactivation. */
  private isAdministrator(role: RoleRecord): boolean {
    return role.isLocked || role.code === ADMINISTRATOR_ROLE_CODE;
  }

  /** Refuses a change that would take a protected right away from the Administrator role or make it not Active. */
  private checkAdministratorChange(fields: RoleFields, cells: RoleCellInput[] | null): void {
    if (fields.status !== RoleStatus.ACTIVE) throw new RoleLockedException('The Administrator role must stay Active');
    const removes = (cells ?? []).some((c) => !c.allowed && PROTECTED_RIGHTS.includes(c.permissionKey));
    if (removes) throw new RoleLockedException('The Administrator role keeps its protected rights');
  }

  /**
   * Lists roles.
   *
   * In plain words: returns the roles that match the filters, with type, users, last change and status.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-01
 * @ac        AC-US010-01, AC-US010-07
 * @lld       LLD-EPIC-ADM-01 v0.17 §6.4
 * @status    built
   *
   * @dependencies RoleRepository.findPage
   *
   * @param filter - type, status and name part
   * @returns The roles
   */
  async list(filter: RoleFilter): Promise<RoleRecord[]> {
    return this.roles.findPage(filter);
  }

  /**
   * Creates a role.
   *
   * In plain words: checks the name is free, saves the role with its cells (copied and/or given), and records who did it and why.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-02
 * @ac        AC-US010-02, AC-US010-03, AC-US010-06
 * @lld       LLD-EPIC-ADM-01 v0.17 §6.4
 * @status    built
   *
   * @dependencies RoleRepository.findByName, createWithCells, RolePermissionRepository.listForRole, AuditService.recordChange
   *
   * @param fields - name, description, status
   * @param copyFromRoleId - role to copy cells from, or null
   * @param cells - cells to set after the copy
   * @param actor - user key of the caller
   * @param reason - why
   * @returns The created role
   * @throws RoleNameExistsException - the name is taken (HTTP 409)
   * @throws NotFoundAppException - the copy source does not exist (HTTP 404, ROLE_NOT_FOUND)
   */
  async create(fields: RoleFields, copyFromRoleId: string | null, cells: RoleCellInput[], actor: string, reason: string): Promise<RoleRecord> {
    if (await this.roles.findByName(fields.name)) throw new RoleNameExistsException(`A role named ${fields.name} already exists`);
    const merged = new Map<string, RoleCellInput>();
    if (copyFromRoleId) {
      await this.mustFind(copyFromRoleId);
      for (const c of await this.cells.listForRole(copyFromRoleId)) merged.set(c.key, { permissionKey: c.key, allowed: c.allowed, scope: c.scope });
    }
    for (const c of cells) merged.set(c.permissionKey, c);
    const role = await this.roles.createWithCells(fields, [...merged.values()]);
    await this.audit.recordChange({ actor, entity: 'Role', entityKey: role.id, after: snapshot(role), reason });
    return role;
  }

  /**
   * Changes a role.
   *
   * In plain words: checks the name, refuses to remove a protected right from the Administrator role, saves, and records the change with the reason.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-03
 * @ac        AC-US010-04, AC-US010-06
 * @lld       LLD-EPIC-ADM-01 v0.17 §6.4
 * @status    built
   *
   * @dependencies RoleRepository.findById, findByName, updateWithCells, AuditService.recordChange
   *
   * @param roleId - the role
   * @param fields - the new fields
   * @param cells - cells to write, or null
   * @param actor - user key of the caller
   * @param reason - why
   * @returns The updated role
   * @throws NotFoundAppException - no such role (HTTP 404, ROLE_NOT_FOUND)
   * @throws RoleNameExistsException - another role has the name (HTTP 409)
   * @throws RoleLockedException - a protected right of the Administrator role would be removed (HTTP 403)
   */
  async update(roleId: string, fields: RoleFields, cells: RoleCellInput[] | null, actor: string, reason: string): Promise<RoleRecord> {
    const before = await this.mustFind(roleId);
    const sameName = await this.roles.findByName(fields.name);
    if (sameName && sameName.id !== roleId) throw new RoleNameExistsException(`A role named ${fields.name} already exists`);
    if (this.isAdministrator(before)) this.checkAdministratorChange(fields, cells);
    if (before.type === 'STANDARD' && fields.name !== before.name) throw new RoleLockedException('A standard role keeps its name');
    const role = await this.roles.updateWithCells(roleId, fields, cells);
    await this.audit.recordChange({ actor, entity: 'Role', entityKey: roleId, before: snapshot(before), after: snapshot(role), reason });
    return role;
  }

  /**
   * Deactivates a role.
   *
   * In plain words: sets the role Inactive only when nobody holds it and it is not the Administrator role.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-04
 * @ac        AC-US010-04, AC-US010-05
 * @lld       LLD-EPIC-ADM-01 v0.17 §6.4
 * @status    built
   *
   * @dependencies RoleRepository.findById, countHolders, setStatus, AuditService.recordChange
   *
   * @param roleId - the role
   * @param actor - user key of the caller
   * @param reason - why
   * @returns The role with status INACTIVE
   * @throws NotFoundAppException - no such role (HTTP 404, ROLE_NOT_FOUND)
   * @throws RoleLockedException - it is the Administrator role (HTTP 403)
   * @throws RoleInUseException - users hold it, with the count (HTTP 409)
   */
  async deactivate(roleId: string, actor: string, reason: string): Promise<RoleRecord> {
    const before = await this.mustFind(roleId);
    if (this.isAdministrator(before)) throw new RoleLockedException('The Administrator role cannot be deactivated');
    const userCount = await this.roles.countHolders(roleId);
    if (userCount > 0) throw new RoleInUseException(userCount);
    const role = await this.roles.setStatus(roleId, RoleStatus.INACTIVE);
    await this.audit.recordChange({ actor, entity: 'Role', entityKey: roleId, before: snapshot(before), after: snapshot(role), reason });
    return role;
  }
}
