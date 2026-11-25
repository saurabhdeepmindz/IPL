/**
 * @file    delegation.port.ts
 * @module  UsersModule
 *
 * @description
 * Delegation. In plain words: asks whether a user has handed their work to someone. TBD-ADM01-05: the delegation epic replaces the stand-in.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/ports/delegation.port.ts
 * @lld-synced     v0.21
 * @status         built
 */

/**
 * DelegationPort (port).
 *
 * In plain words: one small question; the application wires the answer.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.21 section 6.1
 */
export abstract class DelegationPort {
  /** True when the user has an active delegate. */
  abstract hasActiveDelegate(userId: string): Promise<boolean>;
}
