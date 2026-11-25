/**
 * @file    temporary-password-mailer.port.ts
 * @module  UsersModule
 *
 * @description
 * E-mail of a one-time password. In plain words: sends the e-mail and says SENT or FAILED. The real adapter (Amazon SES or the IPL SMTP relay) belongs to the e-mail integration.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/ports/temporary-password-mailer.port.ts
 * @lld-synced     v0.29
 * @status         built
 */

/**
 * TemporaryPasswordMailer (port).
 *
 * In plain words: one small question; the application wires the answer.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.29 section 6.1
 */
export abstract class TemporaryPasswordMailer {
  /** Sends the one-time password to the user's e-mail. Never throws: a failure is the answer FAILED. */
  abstract send(to: { email: string; fullName: string }, oneTimePassword: string): Promise<'SENT' | 'FAILED'>;
}
