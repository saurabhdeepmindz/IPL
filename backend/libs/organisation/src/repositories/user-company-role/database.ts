/**
 * @file    database.ts
 * @module  OrganisationModule
 *
 * @description
 * Prisma implementation of the user-company-role repository. EXTENDS the built file with `listByRole`, `findHolders` and `insertMany`.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/organisation/src/repositories/user-company-role/database.ts
 * @lld-synced     v0.23
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { DbTransaction, UserCompanyRoleRepository, UserRoleGrant, NewAssignment, RoleHolderRow } from './contract';

/**
 * Database implementation of UserCompanyRoleRepository.
 *
 * In plain words: reads the user_company_roles table.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Injectable()
export class UserCompanyRoleDatabaseRepository extends UserCompanyRoleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** {@inheritDoc UserCompanyRoleRepository.listByUser} */
  async listByUser(userId: string, companyCode: string, validOn: Date): Promise<UserRoleGrant[]> {
    const rows = await this.prisma.db.userCompanyRole.findMany({
      where: {
        userId,
        companyCode,
        validFrom: { lte: validOn },
        OR: [{ validTo: null }, { validTo: { gte: validOn } }],
      },
      include: { role: true },
    });
    return rows.map((r) => ({
      roleId: r.roleId,
      roleCode: r.role.code,
      roleStatus: r.role.status,
      validFrom: r.validFrom,
      validTo: r.validTo,
    }));
  }

  /**
   * Lists the holders of a role.
   *
   * In plain words: the people who hold the role today, with name, department, company and the day they got it.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-011
 * @subtask   ST-ADM01-011-BE-04
 * @frd       FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-05
 * @ac        AC-US011-02
 * @lld       LLD-EPIC-ADM-01 v0.23 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db or raw userCompanyRole.findMany
   *
   * @param roleId - the role
   * @param companyCode - one company, or null for every company
   * @param validOn - the day
   * @returns The holders, newest assignment first
   */
  async listByRole(roleId: string, companyCode: string | null, validOn: Date): Promise<RoleHolderRow[]> {
    // null asks for every company, so it reads the unfiltered client on purpose (decision L-33); a company code reads the filtered one.
    const client = companyCode === null ? this.prisma.raw : this.prisma.db;
    const rows = await client.userCompanyRole.findMany({
      where: {
        roleId,
        ...(companyCode === null ? {} : { companyCode }),
        validFrom: { lte: validOn },
        OR: [{ validTo: null }, { validTo: { gte: validOn } }],
      },
      include: { user: { include: { department: true } } },
      orderBy: { assignedOn: 'desc' },
    });
    return rows.map((r) => ({ employeeCode: r.user.employeeCode, fullName: r.user.fullName, departmentName: r.user.department?.name ?? null, companyCode: r.companyCode, assignedOn: r.assignedOn }));
  }

  /**
   * Finds who already holds a role.
   *
   * In plain words: the users that already hold the role in the company on the day, so they are skipped and not duplicated.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-011
 * @subtask   ST-ADM01-011-BE-04
 * @frd       FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-06
 * @ac        AC-US011-01
 * @lld       LLD-EPIC-ADM-01 v0.23 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db userCompanyRole.findMany
   *
   * @param roleId - the role
   * @param companyCode - the company
   * @param userIds - the users to check
   * @param onDate - the first day of the new assignment
   * @returns The ids of the users that already hold it
   */
  async findHolders(roleId: string, companyCode: string, userIds: string[], onDate: Date): Promise<string[]> {
    const rows = await this.prisma.db.userCompanyRole.findMany({
      where: { roleId, companyCode, userId: { in: userIds }, OR: [{ validTo: null }, { validTo: { gte: onDate } }] },
      select: { userId: true },
      distinct: ['userId'],
    });
    return rows.map((r) => r.userId);
  }

  /**
   * Writes assignments.
   *
   * In plain words: saves the new company-role rows together, or none.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-011
 * @subtask   ST-ADM01-011-BE-04
 * @frd       FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-06
 * @ac        AC-US011-01, AC-US011-03
 * @lld       LLD-EPIC-ADM-01 v0.23 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db $transaction, userCompanyRole.createMany
   *
   * @param rows - the assignments to write
   * @returns The number written
   */
  async insertMany(rows: NewAssignment[]): Promise<number> {
    return this.prisma.db.$transaction(async (tx) => {
      const written = await tx.userCompanyRole.createMany({ data: rows.map((r) => ({ ...r, validTo: r.validTo ?? null })) });
      return written.count;
    });
  }

  /**
   * Replaces the company roles of a user.
   *
   * In plain words: keeps the roles that stay, ends the ones that go (yesterday, or drops them when they never started) and adds the new ones, all together.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-05
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02, API-USR-04
 * @ac        AC-US003-03
 * @lld       LLD-EPIC-ADM-01 v0.23 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db $transaction, userCompanyRole.findMany, update, deleteMany, createMany
   *
   * @param userId - the user
   * @param rows - the roles the user must hold
   * @param tx - the caller's transaction, when there is one
   * @returns Nothing
   */
  async replaceForUser(userId: string, rows: NewAssignment[], tx?: DbTransaction): Promise<void> {
    const run = (client: DbTransaction) => replaceRows(client, userId, rows);
    if (tx) return run(tx);
    return this.prisma.db.$transaction((inner) => run(inner as unknown as DbTransaction));
  }
}

const day = (d: Date): number => Math.floor(d.getTime() / 86400000);
const keyOf = (r: { roleId: string; companyCode: string; validFrom: Date }): string => `${r.roleId}|${r.companyCode}|${day(r.validFrom)}`;

/** Does the work of `replaceForUser` on one client. */
async function replaceRows(client: DbTransaction, userId: string, rows: NewAssignment[]): Promise<void> {
  const yesterday = new Date();
  yesterday.setUTCHours(0, 0, 0, 0);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const wanted = new Map(rows.map((r) => [keyOf(r), r]));
  const current = await client.userCompanyRole.findMany({ where: { userId, OR: [{ validTo: null }, { validTo: { gt: yesterday } }] } });
  for (const row of current) {
    const want = wanted.get(keyOf(row));
    wanted.delete(keyOf(row));
    if (want) {
      const to = want.validTo ?? null;
      if ((to?.getTime() ?? null) !== (row.validTo?.getTime() ?? null)) await client.userCompanyRole.update({ where: { id: row.id }, data: { validTo: to } });
    } else if (row.validFrom > yesterday) await client.userCompanyRole.delete({ where: { id: row.id } });
    else await client.userCompanyRole.update({ where: { id: row.id }, data: { validTo: yesterday } });
  }
  if (wanted.size) await client.userCompanyRole.createMany({ data: [...wanted.values()].map((r) => ({ ...r, userId, validTo: r.validTo ?? null })) });
}
