/**
 * @file    log-mail-transport.ts
 * @module  MailmanModule
 *
 * @description
 * The stub mail transport. In plain words: writes the e-mail to the log and to the local mail trap, so links can be opened in development, test and UAT; refused in production.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/mailman/src/log-mail-transport.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable, Logger } from '@nestjs/common';
import { MailTransport } from './mail-transport';
import { PreparedMail } from './mail.types';
import { SmtpMailTransport } from './smtp-mail-transport';

/**
 * LogMailTransport.
 *
 * In plain words: the stand-in until the IPL mail details arrive. It writes the address, the subject and any link to the log (never the text of a one-time password) and also hands the message to the local mail trap when one is given. Refused in production.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
@Injectable()
export class LogMailTransport extends MailTransport {
  private readonly logger = new Logger(LogMailTransport.name);

  constructor(private readonly trap: SmtpMailTransport | null) {
    super();
  }

  async send(message: PreparedMail): Promise<void> {
    const link = /https?:\/\/\S+/.exec(message.text)?.[0];
    this.logger.log(`MAIL to ${message.to}: ${message.subject}` + (link ? ` | link ${link}` : ''));
    if (!this.trap) return;
    try {
      await this.trap.send(message);
    } catch {
      this.logger.warn('The local mail trap did not take the message (it is not running); the log line above is all there is.');
    }
  }
}
