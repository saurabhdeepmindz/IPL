/**
 * @file    session-revocation.port.ts
 * @module  UsersModule
 *
 * @description
 * Ending sessions. In plain words: tells the sign-in service to end every session of a user. TBD-ADM01-02: the sign-in epic replaces the stand-in.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/libs/users/src/ports/session-revocation.port.ts
 * @lld-synced     v0.30
 * @status         built
 */

/**
 * SessionRevocationPort (port).
 *
 * In plain words: one small question; the application wires the answer.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.29 section 6.1
 */
export abstract class SessionRevocationPort {
  /** Ends every session of the user. */
  abstract endSessions(userId: string): Promise<void>;
}
