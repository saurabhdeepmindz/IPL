/**
 * @file    contract.ts
 * @module  UsersModule
 *
 * @description
 * Contract of the one-time password repository. In plain words: keeps only the hash of the newest one-time password of a user.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/one-time-password/contract.ts
 * @lld-synced     v0.26
 * @status         built
 */

/**
 * One-time password repository contract.
 *
 * In plain words: the one-time password service depends on this class.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-07, API-USR-08
 *   lld:       LLD-EPIC-ADM-01 v0.26 section 6.1
 */
export abstract class OneTimePasswordRepository {
  /** Stops every unused one-time password of the user and stores this hash as the newest. */
  abstract replace(userId: string, hash: string): Promise<void>;

  /** The newest hash of the user that has not been used, or null. */
  abstract findLatest(userId: string): Promise<{ hash: string; issuedAt: Date } | null>;
}
