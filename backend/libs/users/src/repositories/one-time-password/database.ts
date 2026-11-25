/**
 * @file    database.ts
 * @module  UsersModule
 *
 * @description
 * Prisma implementation of the one-time password repository. In plain words: the only file that reads and writes `one_time_passwords`.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/one-time-password/database.ts
 * @lld-synced     v0.19
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { OneTimePasswordRepository } from './contract';

/**
 * Prisma one-time password repository.
 *
 * In plain words: replaces and reads the hash.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-07, API-USR-08
 *   lld:       LLD-EPIC-ADM-01 v0.19 section 6.1
 */
@Injectable()
export class OneTimePasswordDatabaseRepository extends OneTimePasswordRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Replaces the one-time password.
   *
   * In plain words: the old ones stop working and the new hash is stored.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-04
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-08
 * @ac        AC-US007-03
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db $transaction, oneTimePassword.updateMany, create
   *
   * @param userId - the user
   * @param hash - the hash of the new password
   * @returns Nothing
   */
  async replace(userId: string, hash: string): Promise<void> {
    await this.prisma.db.$transaction(async (tx) => {
      await tx.oneTimePassword.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
      await tx.oneTimePassword.create({ data: { userId, hash } });
    });
  }

  /**
   * Reads the newest one-time password.
   *
   * In plain words: the hash and the day it was issued, if it has not been used.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-04
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-08
 * @ac        AC-US007-03
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db oneTimePassword.findFirst
   *
   * @param userId - the user
   * @returns The hash and issue time, or null
   */
  async findLatest(userId: string): Promise<{ hash: string; issuedAt: Date } | null> {
    const row = await this.prisma.db.oneTimePassword.findFirst({ where: { userId, usedAt: null }, orderBy: { issuedAt: 'desc' } });
    return row ? { hash: row.hash, issuedAt: row.issuedAt } : null;
  }
}
