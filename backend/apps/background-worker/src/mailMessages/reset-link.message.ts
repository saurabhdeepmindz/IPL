/**
 * @file    reset-link.message.ts
 * @module  BackgroundWorker
 *
 * @description
 * The reset e-mail. In plain words: the subject and text of the password reset e-mail with the 30-minute link.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-02
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/apps/background-worker/src/mailMessages/reset-link.message.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { MailTemplate } from '@libs/mailman';

/**
 * composeResetLink.
 *
 * In plain words: the e-mail with the link to set a new password. It names the 30-minute limit and holds no password.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
export const composeResetLink: MailTemplate = (data) => ({
  subject: 'Reset your AMS password',
  text: `Dear ${data.fullName},\n\nWe received a request to reset your AMS password. Open this link to choose a new one:\n${data.link}\n\nThe link works once and expires in 30 minutes. If you did not ask for it, you can ignore this e-mail; your password has not changed.\n\nIndian Potash Limited · Approval Management System`,
  html: `<p>Dear ${esc(data.fullName)},</p><p>We received a request to reset your AMS password. <a href="${esc(data.link)}">Choose a new password</a>.</p><p>The link works once and expires in 30 minutes. If you did not ask for it, you can ignore this e-mail; your password has not changed.</p><p>Indian Potash Limited · Approval Management System</p>`,
});

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
