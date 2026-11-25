/**
 * @file    database.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Prisma implementation of the matrix version repository. In plain words: the only file that reads and writes `permission_matrix_versions`.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.14 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.14.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/permission-matrix-version/database.ts
 * @lld-synced     v0.14
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { BadRequestAppException } from '@libs/common';
import { PrismaService } from '@libs/database';
import { StaleMatrixException } from '../../errors/stale-matrix.exception';
import { CellWrite, PermissionMatrixVersionRepository } from './contract';

/**
 * Prisma matrix version repository.
 *
 * In plain words: reads the current version and commits a save atomically.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-01, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.14 §6.6
 */
/** True for the error Prisma gives when a unique value is used twice. */
const isUniqueViolation = (err: unknown): boolean => typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002';

@Injectable()
export class PermissionMatrixVersionDatabaseRepository extends PermissionMatrixVersionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Reads the current version.
   *
   * In plain words: the highest version number saved so far, or 0.
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
   * @dependencies PrismaService.db permissionMatrixVersion.aggregate
   *
   * @returns The current version number
   */
  async current(): Promise<number> {
    const max = await this.prisma.db.permissionMatrixVersion.aggregate({ _max: { version: true } });
    return max._max.version ?? 0;
  }

  /**
   * Commits a save.
   *
   * In plain words: checks the version, writes the cells and adds the next version, all in one transaction.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-03
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-03
 * @ac        AC-US014-03, AC-US014-04, AC-US014-05
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.6
 * @status    built
   *
   * @dependencies PrismaService.db $transaction, rolePermission.update, permissionMatrixVersion.create
   *
   * @param expectedVersion - the version the caller saw
   * @param writes - the cells to write
   * @param savedBy - employee code of the caller
   * @param reason - why
   * @returns The new version number
   * @throws StaleMatrixException - the version moved on (HTTP 409)
   */
  async commit(expectedVersion: number, writes: CellWrite[], savedBy: string, reason: string): Promise<number> {
    try {
      return await this.prisma.db.$transaction(async (tx) => {
        const max = await tx.permissionMatrixVersion.aggregate({ _max: { version: true } });
        if ((max._max.version ?? 0) !== expectedVersion) throw new StaleMatrixException();
        for (const w of writes) {
          const permission = await tx.permission.findUnique({ where: { code: w.permissionKey } });
          if (!permission) throw new BadRequestAppException('UNKNOWN_PERMISSION', `Unknown permission ${w.permissionKey}`);
          const data = { allowed: w.allowed, scope: w.scope };
          const where = { roleId_permissionId: { roleId: w.roleId, permissionId: permission.id } };
          await tx.rolePermission.upsert({ where, update: data, create: { roleId: w.roleId, permissionId: permission.id, ...data } });
        }
        await tx.permissionMatrixVersion.create({ data: { version: expectedVersion + 1, savedBy, reason } });
        return expectedVersion + 1;
      });
    } catch (err) {
      if (isUniqueViolation(err)) throw new StaleMatrixException();
      throw err;
    }
  }
}
