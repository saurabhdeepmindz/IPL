/**
 * @file    database.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Prisma implementation of the role-permission repository. EXTENDS the built file with `replaceForRole` and `copyFrom`.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010, US-ADM01-014
 * @subtask        ST-ADM01-010-BE-04, ST-ADM01-014-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.14 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.14.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/role-permission/database.ts
 * @lld-synced     v0.14
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { BadRequestAppException } from '@libs/common';
import { PrismaService } from '@libs/database';
import { MatrixData, PermissionCell, RolePermissionRepository } from './contract';

/**
 * Prisma role-permission repository.
 *
 * In plain words: reads and writes the cells of the matrix.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-02, API-ROL-03, API-PRM-01, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.14 §6.4
 */
@Injectable()
export class RolePermissionDatabaseRepository extends RolePermissionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async listForRole(roleId: string): Promise<PermissionCell[]> {
    const rows = await this.prisma.db.rolePermission.findMany({ where: { roleId }, include: { permission: true } });
    return rows.map((r) => ({ key: r.permission.code, allowed: r.allowed, scope: r.scope }));
  }

  /**
   * Replaces the cells of a role.
   *
   * In plain words: writes the given cells and sets every other cell to not allowed.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-03
 * @ac        AC-US010-02, AC-US010-04
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db rolePermission.upsert
   *
   * @param roleId - the role
   * @param cells - the cells to write
   * @returns Nothing
   */
  async replaceForRole(roleId: string, cells: PermissionCell[]): Promise<void> {
    await this.prisma.db.$transaction(async (tx) => {
      const permissions = await tx.permission.findMany();
      const known = new Set(permissions.map((p) => p.code));
      const unknown = cells.find((c) => !known.has(c.key));
      if (unknown) throw new BadRequestAppException('UNKNOWN_PERMISSION', `Unknown permission ${unknown.key}`);
      const given = new Map(cells.map((c) => [c.key, c]));
      for (const p of permissions) {
        const c = given.get(p.code);
        const data = { allowed: c?.allowed ?? false, scope: c?.scope ?? null };
        await tx.rolePermission.upsert({ where: { roleId_permissionId: { roleId, permissionId: p.id } }, update: data, create: { roleId, permissionId: p.id, ...data } });
      }
    });
  }

  /**
   * Copies the cells of one role to another.
   *
   * In plain words: a new role starts with the same rights as an existing one.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-02
 * @ac        AC-US010-02
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db rolePermission.findMany, createMany
   *
   * @param sourceRoleId - the role to copy from
   * @param targetRoleId - the role to copy to
   * @returns Nothing
   */
  async copyFrom(sourceRoleId: string, targetRoleId: string): Promise<void> {
    await this.prisma.db.$transaction(async (tx) => {
      const source = await tx.rolePermission.findMany({ where: { roleId: sourceRoleId } });
      for (const c of source) {
        const data = { allowed: c.allowed, scope: c.scope };
        await tx.rolePermission.upsert({ where: { roleId_permissionId: { roleId: targetRoleId, permissionId: c.permissionId } }, update: data, create: { roleId: targetRoleId, permissionId: c.permissionId, ...data } });
      }
    });
  }

  /**
   * Reads the whole matrix.
   *
   * In plain words: every permission with its module and label, and every cell of every role.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-03
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US014-01
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.6
 * @status    built
   *
   * @dependencies PrismaService.db permission.findMany, rolePermission.findMany
   *
   * @returns The permissions and the cells
   */
  async readMatrix(): Promise<MatrixData> {
    const permissions = await this.prisma.db.permission.findMany({ orderBy: [{ area: 'asc' }, { code: 'asc' }] });
    const rows = await this.prisma.db.rolePermission.findMany({ include: { permission: true } });
    return {
      permissions: permissions.map((p) => ({ key: p.code, module: p.area, label: p.description })),
      cells: rows.map((r) => ({ roleId: r.roleId, key: r.permission.code, allowed: r.allowed, scope: r.scope })),
    };
  }
}
