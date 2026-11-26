/**
 * @file    password.contract.ts
 * @module  UsersModule
 *
 * @description
 * Password writes. In plain words: sets a password hash and clears the must-change flag (new methods on the user write side).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-002, US-LGN02-004
 * @subtask        ST-LGN02-002-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/users/src/repositories/user-write/password.contract.ts
 * @lld-synced     v0.3
 * @status         built (extend)
 */

/**
 * UserPasswordWrites.
 *
 * In plain words: the writes of a password: the hash on the user, and the one-time password marked used.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-002
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-002-01, AC-US-LGN02-002-02
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
export abstract class UserPasswordWrites {
  /** Saves the hash and the hash method, clears the "must change" flag, the failed attempts and the lock. */
  abstract setPasswordHash(userId: string, hash: string, hashType: string): Promise<void>;

  /** Marks the unused one-time passwords of the user as used. */
  abstract markOneTimePasswordUsed(userId: string): Promise<void>;
}
