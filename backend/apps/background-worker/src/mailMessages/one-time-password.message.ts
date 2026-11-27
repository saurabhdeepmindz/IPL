/**
 * @file    one-time-password.message.ts
 * @module  BackgroundWorker
 *
 * @description
 * The one-time password e-mail. In plain words: the subject and text of the e-mail that carries a new one-time password.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/apps/background-worker/src/mailMessages/one-time-password.message.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { MailTemplate } from '@libs/mailman';

/**
 * composeOneTimePassword.
 *
 * In plain words: the e-mail that gives a user the one-time password set by the IT team, and says it must be changed at the first sign-in.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
export const composeOneTimePassword: MailTemplate = (data) => ({
  subject: 'Your AMS one-time password',
  text: `Dear ${data.fullName},\n\nThe IT team has set a one-time password for your AMS account:\n${data.oneTimePassword}\n\nYou must change it at your first sign-in. Do not share it with anyone.\n\nIndian Potash Limited · Approval Management System`,
  html: `<p>Dear ${esc(data.fullName)},</p><p>The IT team has set a one-time password for your AMS account:</p><p><b>${esc(data.oneTimePassword)}</b></p><p>You must change it at your first sign-in. Do not share it with anyone.</p><p>Indian Potash Limited · Approval Management System</p>`,
});

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
