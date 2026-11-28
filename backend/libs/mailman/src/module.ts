/**
 * @file    module.ts
 * @module  MailmanModule
 *
 * @description
 * Chooses the transport. In plain words: picks SES, the SMTP relay or the log transport by `MAIL_TRANSPORT` and refuses the log transport in production.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/mailman/src/mailman.module.ts
 * @lld-synced     v0.5
 * @status         built (replace)
 */

import { Module } from '@nestjs/common';
import mailConfig from '@config/mail';
import { readEnv } from '@config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueuesModule } from '@libs/queues';
import { LogMailTransport } from './log-mail-transport';
import { Mailman } from './mailman.service';
import { MailTransport } from './mail-transport';
import { MailLogRepository } from './repositories/mail-log/contract';
import { MailLogDatabaseRepository } from './repositories/mail-log/database';
import { SesMailTransport } from './ses-mail-transport';
import { SmtpMailTransport } from './smtp-mail-transport';

/**
 * Chooses the transport from the settings.
 *
 * In plain words: `ses`, `smtp` or `log`; `log` is refused in production (decision L-03).
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-005
 * @subtask   ST-LGN02-005-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-005-04
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.0
 * @status    built
 *
 * @throws Error for `log` in production or an unknown name
 */
export function chooseTransport(name: string, appEnv: string, config: ConfigService | null): MailTransport {
  const mail = config?.get<ReturnType<typeof mailConfig>>('mail') ?? mailConfig();
  const smtp = () => new SmtpMailTransport({ host: mail.smtpHost, port: mail.smtpPort, user: mail.smtpUser, password: mail.smtpPassword, from: mail.from });
  if (name === 'ses') return new SesMailTransport(mail.sesRegion, mail.from);
  if (name === 'smtp') return smtp();
  if (name === 'log') {
    if (appEnv === 'prod') throw new Error('MAIL_TRANSPORT log is not allowed when APP_ENV is prod');
    return new LogMailTransport(config ? smtp() : null);
  }
  throw new Error('MAIL_TRANSPORT must be ses, smtp or log');
}

/**
 * MailmanModule.
 *
 * In plain words: gives other parts the mailman; the transport is chosen by the setting MAIL_TRANSPORT.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
@Module({
  imports: [ConfigModule, QueuesModule],
  providers: [
    Mailman,
    { provide: MailLogRepository, useClass: MailLogDatabaseRepository },
    { provide: MailTransport, useFactory: (config: ConfigService) => chooseTransport(config.get<string>('mail.transport') ?? mailConfig().transport, config.get<string>('APP_ENV') ?? readEnv('APP_ENV', 'dev') ?? 'dev', config), inject: [ConfigService] },
  ],
  exports: [Mailman, MailTransport, MailLogRepository],
})
export class MailmanModule {}
