/**
 * @file    database.ts
 * @module  MailmanModule
 *
 * @description
 * Mail log, Prisma side. In plain words: the Prisma implementation of the mail log.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/mailman/src/repositories/mail-log/database.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { MailLogRepository } from './contract';

/**
 * MailLogDatabaseRepository.
 *
 * In plain words: the Prisma implementation of the mail record.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
@Injectable()
export class MailLogDatabaseRepository extends MailLogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async add(entry: { messageName: string; recipient: string; result: string; attempts: number }): Promise<void> {
    await this.prisma.db.mailLog.create({ data: { ...entry, sentAt: entry.result === 'SENT' ? new Date() : null } });
  }
}
