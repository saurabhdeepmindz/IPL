/**
 * @file    seed-roles.command.ts
 * @module  ControlPanel
 *
 * @description
 * Command seed:roles. In plain words: creates the six standard roles, the permission list and one cell per role per permission. Running it twice gives the same rows.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-07
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { GRANTS, PERMISSIONS, STANDARD_ROLES } from './seed-data';

/**
 * seed:roles.
 *
 * In plain words: safe to run again; it adds what is missing and resets the standard cells to the agreed starting point.
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
export class SeedRolesCommand {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Run the command.
   *
   * In plain words: upserts roles and permissions, then writes every cell.
   *
   * @returns Counts of roles, permissions and cells
   * @dependencies PrismaService.raw
   */
  async run(): Promise<{ roles: number; permissions: number; cells: number }> {
    const db = this.prisma.raw;
    for (const r of STANDARD_ROLES) {
      await db.role.upsert({
        where: { code: r.code },
        update: { name: r.name, description: r.description, type: 'STANDARD', status: 'ACTIVE', isLocked: r.isLocked, landingOrder: r.landingOrder },
        create: { ...r, type: 'STANDARD', status: 'ACTIVE' },
      });
    }
    for (const p of PERMISSIONS) {
      await db.permission.upsert({ where: { code: p.code }, update: { area: p.area, description: p.description }, create: p });
    }
    const roles = await db.role.findMany({ where: { code: { in: STANDARD_ROLES.map((r) => r.code) } } });
    const perms = await db.permission.findMany({ where: { code: { in: PERMISSIONS.map((p) => p.code) } } });
    let cells = 0;
    for (const role of roles) {
      for (const perm of perms) {
        const grant = GRANTS[role.code] ?? {};
        const allowed = perm.code in grant;
        const scope = allowed ? grant[perm.code] : null;
        await db.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: { allowed, scope },
          create: { roleId: role.id, permissionId: perm.id, allowed, scope },
        });
        cells += 1;
      }
    }
    return { roles: roles.length, permissions: perms.length, cells };
  }
}
