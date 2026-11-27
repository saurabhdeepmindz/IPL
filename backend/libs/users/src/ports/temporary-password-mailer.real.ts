/**
 * @file    temporary-password-mailer.real.ts
 * @module  UsersModule
 *
 * @description
 * The real one-time password mailer. In plain words: sends the one-time password e-mail through the mail service; replaces the stand-in of EPIC-ADM-01.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/users/src/ports/temporary-password-mailer.real.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable, Logger } from '@nestjs/common';
import { Mailman } from '@libs/mailman';
import { TemporaryPasswordMailer } from './temporary-password-mailer.port';

/**
 * RealTemporaryPasswordMailer.
 *
 * In plain words: sends the one-time password e-mail through the mail adapter (replaces the stand-in). It answers SENT when the e-mail is queued and FAILED when queueing fails; it never throws.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
@Injectable()
export class RealTemporaryPasswordMailer extends TemporaryPasswordMailer {
  private readonly logger = new Logger(RealTemporaryPasswordMailer.name);

  constructor(private readonly mail: Mailman) {
    super();
  }

  async send(to: { email: string; fullName: string }, oneTimePassword: string): Promise<'SENT' | 'FAILED'> {
    try {
      await this.mail.send(to.email, 'one-time-password', { fullName: to.fullName, oneTimePassword });
      return 'SENT';
    } catch (error) {
      this.logger.error('The one-time password e-mail could not be queued: ' + (error as Error).message);
      return 'FAILED';
    }
  }
}
