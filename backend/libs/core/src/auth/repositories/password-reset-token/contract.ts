/**
 * @file    contract.ts
 * @module  AuthCoreModule
 *
 * @description
 * Reset token contract. In plain words: the interface for single-use reset tokens, kept only as hashes.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-001, US-LGN02-002
 * @subtask        ST-LGN02-001-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/repositories/password-reset-token/contract.ts
 * @lld-synced     v0.5
 * @status         built
 */

/** Who a reset link belongs to (read together with the link so the service needs no second lookup). */
export interface ResetTokenOwner {
  userId: string;
  employeeCode: string;
  email: string;
  fullName: string;
}

/**
 * PasswordResetTokenRepository.
 *
 * In plain words: the reset links that were made (only the hash of each token is kept).
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-001
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-001-01, AC-US-LGN02-001-02, AC-US-LGN02-001-03, AC-US-LGN02-001-04, AC-US-LGN02-001-05
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
export abstract class PasswordResetTokenRepository {
  /** Stores a new link and marks the older unused links of the user as replaced, so only the newest works. */
  abstract issue(userId: string, tokenHash: string): Promise<void>;

  /** Finds a link that is unused, not replaced and not older than `maxAgeMinutes`; null otherwise. */
  abstract findValid(tokenHash: string, now: Date, maxAgeMinutes: number): Promise<ResetTokenOwner | null>;

  /** Uses a link up; false when it was already used (two calls at once: only one wins). */
  abstract markUsed(tokenHash: string): Promise<boolean>;
}
