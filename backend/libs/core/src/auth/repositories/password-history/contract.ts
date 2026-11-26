/**
 * @file    contract.ts
 * @module  AuthCoreModule
 *
 * @description
 * Password history contract. In plain words: the interface for the last three password hashes of a user.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-003
 * @subtask        ST-LGN02-003-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/repositories/password-history/contract.ts
 * @lld-synced     v0.3
 * @status         built
 */

/**
 * PasswordHistoryRepository.
 *
 * In plain words: the last password hashes of a user (the policy asks for them; nothing else reads them).
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-003
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-003-02
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
export abstract class PasswordHistoryRepository {
  /** Returns the newest `count` hashes, newest first. */
  abstract lastHashes(userId: string, count: number): Promise<string[]>;

  /** Adds a hash with its hash type. */
  abstract add(userId: string, hash: string, hashType: string): Promise<void>;

  /** Keeps only the newest `keep` rows of the user. */
  abstract trim(userId: string, keep: number): Promise<void>;
}
