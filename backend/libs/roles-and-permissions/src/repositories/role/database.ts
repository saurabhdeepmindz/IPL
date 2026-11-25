/**
 * @file    database.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Prisma implementation of the role repository. In plain words: the only file that reads and writes the roles table.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.14 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.14.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/role/database.ts
 * @lld-synced     v0.14
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService, RoleStatus } from '@libs/database';
import { RoleCellInput, RoleFields, RoleFilter, RoleRecord, RoleRepository } from './contract';
import { freeCode, holdersByRole, toRecord, writeCells } from './role-helpers';

/**
 * Prisma role repository.
 *
 * In plain words: reads and writes roles and their cells; counts holders across every company.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-01 to API-ROL-04
 *   lld:       LLD-EPIC-ADM-01 v0.14 §6.4
 */
@Injectable()
export class RoleDatabaseRepository extends RoleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Lists roles.
   *
   * In plain words: finds roles by type, status and name, newest change first, with the user count of each.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-03
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-01
 * @ac        AC-US010-01, AC-US010-07
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db role.findMany, RoleDatabaseRepository.countHolders
   *
   * @param filter - type, status and name part
   * @returns The matching roles
   */
  async findPage(filter: RoleFilter): Promise<RoleRecord[]> {
    const roles = await this.prisma.db.role.findMany({
      where: {
        ...(filter.type ? { type: filter.type } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.q ? { name: { contains: filter.q, mode: 'insensitive' as const } } : {}),
      },
      orderBy: [{ landingOrder: 'asc' }, { name: 'asc' }],
    });
    const counts = await holdersByRole(this.prisma, roles.map((r) => r.id));
    return roles.map((r) => toRecord(r, counts.get(r.id) ?? 0));
  }

  /**
   * Finds one role.
   *
   * In plain words: returns the role with its user count, or nothing.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-03
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-03
 * @ac        AC-US010-04
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db role.findUnique
   *
   * @param roleId - the role
   * @returns The role or null
   */
  async findById(roleId: string): Promise<RoleRecord | null> {
    const role = await this.prisma.db.role.findUnique({ where: { id: roleId } });
    return role ? toRecord(role, (await holdersByRole(this.prisma, [roleId])).get(roleId) ?? 0) : null;
  }

  /**
   * Finds a role by name.
   *
   * In plain words: used to refuse a name that is taken (the match ignores upper and lower case).
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-03
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-02
 * @ac        AC-US010-03
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db role.findFirst
   *
   * @param name - the name to look for
   * @returns The role or null
   */
  async findByName(name: string): Promise<RoleRecord | null> {
    const role = await this.prisma.db.role.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
    return role ? toRecord(role, (await holdersByRole(this.prisma, [role.id])).get(role.id) ?? 0) : null;
  }

  /**
   * Creates a role with its cells.
   *
   * In plain words: writes the role row and its permission cells in one transaction, so a role never exists half-saved.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-03
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-02
 * @ac        AC-US010-02
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db $transaction, role.create, rolePermission.createMany
   *
   * @param fields - name, description, status
   * @param cells - the cells to write
   * @returns The created role
   */
  async createWithCells(fields: RoleFields, cells: RoleCellInput[]): Promise<RoleRecord> {
    const role = await this.prisma.db.$transaction(async (tx) => {
      const created = await tx.role.create({ data: { ...fields, code: await freeCode(tx, fields.name), type: 'CUSTOM' } });
      await writeCells(tx, created.id, cells);
      return created;
    });
    return toRecord(role, 0);
  }

  /**
   * Changes a role and its cells.
   *
   * In plain words: updates name, description and status and, when cells are given, replaces them, all in one transaction.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-03
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-03
 * @ac        AC-US010-04, AC-US010-06
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db $transaction, role.update, rolePermission.upsert
   *
   * @param roleId - the role
   * @param fields - the new fields
   * @param cells - the cells to write, or null to leave them
   * @returns The updated role
   */
  async updateWithCells(roleId: string, fields: RoleFields, cells: RoleCellInput[] | null): Promise<RoleRecord> {
    const role = await this.prisma.db.$transaction(async (tx) => {
      const updated = await tx.role.update({ where: { id: roleId }, data: fields });
      if (cells !== null) await writeCells(tx, roleId, cells);
      return updated;
    });
    return toRecord(role, (await holdersByRole(this.prisma, [roleId])).get(roleId) ?? 0);
  }

  /**
   * Sets the status of a role.
   *
   * In plain words: moves the role between Draft, Active and Inactive.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-03
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-04
 * @ac        AC-US010-05
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db role.update
   *
   * @param roleId - the role
   * @param status - the new status
   * @returns The updated role
   */
  async setStatus(roleId: string, status: RoleStatus): Promise<RoleRecord> {
    const role = await this.prisma.db.role.update({ where: { id: roleId }, data: { status } });
    return toRecord(role, (await holdersByRole(this.prisma, [roleId])).get(roleId) ?? 0);
  }

  /**
   * Counts the users who hold a role.
   *
   * In plain words: counts distinct users in every company, because a role is the same in every company.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-03
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-04
 * @ac        AC-US010-05
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.4
 * @status    built
   *
   * @dependencies PrismaService.raw userCompanyRole.groupBy
   *
   * @param roleId - the role
   * @returns The number of distinct users
   */
  async countHolders(roleId: string): Promise<number> {
    return (await holdersByRole(this.prisma, [roleId])).get(roleId) ?? 0;
  }
}
