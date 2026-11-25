/**
 * @file    temporary-password-mailer.stand-in.ts
 * @module  UsersModule
 *
 * @description
 * Stand-in of TemporaryPasswordMailer. In plain words: logs without the password; SENT in dev and test, FAILED elsewhere.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/ports/temporary-password-mailer.stand-in.ts
 * @lld-synced     v0.27
 * @status         built
 */

import { Injectable, Logger } from '@nestjs/common';
import { TemporaryPasswordMailer } from './temporary-password-mailer.port';

/**
 * TemporaryPasswordMailerStandIn.
 *
 * In plain words: logs without the password; SENT in dev and test, FAILED elsewhere.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.27 section 6.1
 */
@Injectable()
export class TemporaryPasswordMailerStandIn extends TemporaryPasswordMailer {
  private readonly logger = new Logger(TemporaryPasswordMailerStandIn.name);

  async send(): Promise<'SENT' | 'FAILED'> {
    const dev = ['dev', 'test'].includes(process.env.APP_ENV ?? 'dev');
    if (dev) {
      this.logger.log('A one-time password mail would be sent now (stand-in; the password is never logged).');
      return 'SENT';
    }
    this.logger.warn('No mail adapter is configured, so the one-time password mail was not sent.');
    return 'FAILED';
  }
}
