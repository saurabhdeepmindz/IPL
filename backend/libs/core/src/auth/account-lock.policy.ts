/**
 * @file    account-lock.policy.ts
 * @module  AuthCoreModule
 *
 * @description
 * The lock rule. In plain words: five wrong passwords lock the account for 15 minutes; a correct sign-in clears the count.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001
 * @subtask        ST-LGN01-001-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/account-lock.policy.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { Injectable } from '@nestjs/common';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

/**
 * AccountLockPolicy.
 *
 * In plain words: decides when an account is locked or open
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-001
   *   workflows: UF-01
   *   ac:        AC-US-LGN01-001-04, AC-US-LGN01-001-05, AC-US-LGN01-001-06
   *   lld:       LLD-EPIC-LGN-01 v0.4 section 6.1
 */
@Injectable()
export class AccountLockPolicy {
  /**
   * isLocked.
   *
   * In plain words: says whether the account is locked now
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-001
   * @subtask   ST-LGN01-001-BE-02
   * @workflow  UF-01
   * @ac        AC-US-LGN01-001-05, AC-US-LGN01-001-06
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.1
   * @status    built
   *
   * @returns boolean
   */
  isLocked(user: { lockedUntil: Date | null }, now: Date): boolean {
    return user.lockedUntil !== null && user.lockedUntil.getTime() > now.getTime();
  }

  /**
   * afterFailure.
   *
   * In plain words: works out the new counter and lock after a wrong password
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-001
   * @subtask   ST-LGN01-001-BE-02
   * @workflow  UF-01
   * @ac        AC-US-LGN01-001-04, AC-US-LGN01-001-05
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.1
   * @status    built
   *
   * @returns { failedAttempts: number; lockedUntil: Date | null; attemptsLeft: number }
   */
  afterFailure(failedAttempts: number, now: Date): { failedAttempts: number; lockedUntil: Date | null; attemptsLeft: number } {
    const count = failedAttempts + 1;
    const locked = count >= MAX_FAILED_ATTEMPTS;
    return {
      failedAttempts: count,
      lockedUntil: locked ? new Date(now.getTime() + LOCK_MINUTES * 60_000) : null,
      attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - count),
    };
  }
}
