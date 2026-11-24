/**
 * @file    database.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Prisma implementation of the role-permission repository. In plain words: the only file here that talks to the database.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-08
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { PermissionCell, RolePermissionRepository } from './contract';

/**
 * Database implementation of RolePermissionRepository.
 *
 * In plain words: reads the role_permissions table with the permission key.
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
export class RolePermissionDatabaseRepository extends RolePermissionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** {@inheritDoc RolePermissionRepository.listForRole} */
  async listForRole(roleId: string): Promise<PermissionCell[]> {
    const rows = await this.prisma.db.rolePermission.findMany({ where: { roleId }, include: { permission: true } });
    return rows.map((r) => ({ key: r.permission.code, allowed: r.allowed, scope: r.scope }));
  }
}
