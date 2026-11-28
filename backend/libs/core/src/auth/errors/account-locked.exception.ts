/**
 * @file    account-locked.exception.ts
 * @module  AuthCoreModule
 *
 * @description
 * AccountLockedException. In plain words: 423 ACCOUNT_LOCKED: the 5th failure locked the account. @story US-LGN01-001 @ac AC-US-LGN01-001-05
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001, US-LGN01-002, US-LGN01-003
 * @subtask        ST-LGN01-001-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/errors/auth-errors.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { AppException } from '@libs/common';

/** 423 ACCOUNT_LOCKED: the 5th failure locked the account. @story US-LGN01-001 @ac AC-US-LGN01-001-05 */
export class AccountLockedException extends AppException {
  constructor(lockedUntil: Date, reference: string) {
    super(423, 'ACCOUNT_LOCKED', 'The account is locked for a while after too many wrong passwords', [], { lockedUntil: lockedUntil.toISOString(), reference });
  }
}
