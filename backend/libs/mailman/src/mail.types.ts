/**
 * @file    mail.types.ts
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
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/mailman/src/mail.types.ts
 * @lld-synced     v0.5
 * @status         built
 */

/** One message ready to send. */
export interface PreparedMail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/** What goes into the queue: the address, the name of the message and its values. */
export interface MailJob {
  to: string;
  messageName: string;
  data: Record<string, string>;
}

/** One template: values in, subject and text out (the address is added by the mailman). */
export type MailTemplate = (data: Record<string, string>) => Omit<PreparedMail, 'to'>;

/** The templates by message name (they live in the worker application). */
export type MailTemplates = Record<string, MailTemplate>;

/** Injection token of the templates. */
export const MAIL_TEMPLATES = 'MAIL_TEMPLATES';

/** The message names the mailman accepts. */
export const MESSAGE_NAMES = ['reset-link', 'one-time-password'] as const;
