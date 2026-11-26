/**
 * @file    smtp-mail-transport.ts
 * @module  MailmanModule
 *
 * @description
 * SMTP relay transport. In plain words: sends through the IPL SMTP relay (host, port, user, TLS from configuration).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/mailman/src/smtp-mail-transport.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { MailTransport } from './mail-transport';
import { PreparedMail } from './mail.types';

/** What the SMTP transport needs (read from the `mail` settings). */
export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

/**
 * SmtpMailTransport.
 *
 * In plain words: sends through an SMTP server (the IPL relay, or the local mail trap in development).
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
@Injectable()
export class SmtpMailTransport extends MailTransport {
  private readonly transporter: Transporter;

  constructor(private readonly settings: SmtpSettings) {
    super();
    this.transporter = createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.port === 465,
      auth: settings.user ? { user: settings.user, pass: settings.password } : undefined,
      connectionTimeout: 5000,
      socketTimeout: 10000,
    });
  }

  async send(message: PreparedMail): Promise<void> {
    await this.transporter.sendMail({ from: this.settings.from, to: message.to, subject: message.subject, text: message.text, html: message.html });
  }
}
