/**
 * @file    mail-transport.ts
 * @module  MailmanModule
 *
 * @description
 * The mail transport port. In plain words: the one interface every transport (SES, SMTP relay, log) implements.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/mailman/src/mail-transport.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { PreparedMail } from './mail.types';

/**
 * MailTransport.
 *
 * In plain words: sends one prepared message; the transport is chosen by the setting MAIL_TRANSPORT.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
export abstract class MailTransport {
  /** Sends one message; throws when the mail server does not take it. */
  abstract send(message: PreparedMail): Promise<void>;
}
