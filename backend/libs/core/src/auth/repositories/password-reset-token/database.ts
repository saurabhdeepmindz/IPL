/**
 * @file    database.ts
 * @module  AuthCoreModule
 *
 * @description
 * Reset tokens, Prisma side. In plain words: the Prisma implementation of the token contract.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-001, US-LGN02-002
 * @subtask        ST-LGN02-001-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/repositories/password-reset-token/database.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { PasswordResetTokenRepository, ResetTokenOwner } from './contract';

/**
 * PasswordResetTokenDatabaseRepository.
 *
 * In plain words: the Prisma implementation of the reset links.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-001
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-001-01, AC-US-LGN02-001-02, AC-US-LGN02-001-03, AC-US-LGN02-001-04, AC-US-LGN02-001-05
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
@Injectable()
export class PasswordResetTokenDatabaseRepository extends PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async issue(userId: string, tokenHash: string): Promise<void> {
    await this.prisma.db.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({ where: { userId, usedAt: null, replacedAt: null }, data: { replacedAt: new Date() } });
      await tx.passwordResetToken.create({ data: { userId, tokenHash } });
    });
  }

  async findValid(tokenHash: string, now: Date, maxAgeMinutes: number): Promise<ResetTokenOwner | null> {
    const row = await this.prisma.db.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!row || row.usedAt || row.replacedAt) return null;
    if (now.getTime() - row.issuedAt.getTime() > maxAgeMinutes * 60000) return null;
    return { userId: row.userId, employeeCode: row.user.employeeCode, email: row.user.email, fullName: row.user.fullName };
  }

  async markUsed(tokenHash: string): Promise<boolean> {
    const res = await this.prisma.db.passwordResetToken.updateMany({ where: { tokenHash, usedAt: null }, data: { usedAt: new Date() } });
    return res.count > 0;
  }
}
