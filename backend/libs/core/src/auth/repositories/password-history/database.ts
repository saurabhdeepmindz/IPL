/**
 * @file    database.ts
 * @module  AuthCoreModule
 *
 * @description
 * Password history, Prisma side. In plain words: the Prisma implementation of the history contract.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-003
 * @subtask        ST-LGN02-003-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/repositories/password-history/database.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { PasswordHistoryRepository } from './contract';

/**
 * PasswordHistoryDatabaseRepository.
 *
 * In plain words: the Prisma implementation of the password history.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-003
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-003-02
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
@Injectable()
export class PasswordHistoryDatabaseRepository extends PasswordHistoryRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async lastHashes(userId: string, count: number): Promise<string[]> {
    const rows = await this.prisma.db.passwordHistory.findMany({ where: { userId }, orderBy: { setAt: 'desc' }, take: count, select: { hash: true } });
    return rows.map((r) => r.hash);
  }

  async add(userId: string, hash: string, hashType: string): Promise<void> {
    await this.prisma.db.passwordHistory.create({ data: { userId, hash, hashType } });
  }

  async trim(userId: string, keep: number): Promise<void> {
    const old = await this.prisma.db.passwordHistory.findMany({ where: { userId }, orderBy: { setAt: 'desc' }, skip: keep, select: { id: true } });
    if (old.length) await this.prisma.db.passwordHistory.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
  }
}
