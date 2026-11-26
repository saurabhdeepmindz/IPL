/**
 * @file    auth-errors.ts
 * @module  AuthCoreModule
 *
 * @description
 * Sign-in exceptions. In plain words: the small typed errors of the sign-in family, each with its HTTP status and error code.
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

export { IdentityProviderUnavailableException, NoAmsAccountException, SignInCancelledException } from '@libs/integrations';

/** 401 INVALID_CREDENTIALS: the same answer for a wrong code and a wrong password. @story US-LGN01-001 @ac AC-US-LGN01-001-04 */
export class InvalidCredentialsException extends AppException {
  constructor(attemptsLeft: number) {
    super(401, 'INVALID_CREDENTIALS', 'Employee code or password is not right', [], { attemptsLeft });
  }
}

/** 423 ACCOUNT_LOCKED: the 5th failure locked the account. @story US-LGN01-001 @ac AC-US-LGN01-001-05 */
export class AccountLockedException extends AppException {
  constructor(lockedUntil: Date, reference: string) {
    super(423, 'ACCOUNT_LOCKED', 'The account is locked for a while after too many wrong passwords', [], { lockedUntil: lockedUntil.toISOString(), reference });
  }
}

/** 403 ACCOUNT_INACTIVE: the user is deactivated. @story US-LGN01-001 @ac AC-US-LGN01-001-07 */
export class AccountInactiveException extends AppException {
  constructor(reference: string) {
    super(403, 'ACCOUNT_INACTIVE', 'This account is not active. Please contact the helpdesk and quote the reference', [], { reference });
  }
}

/** 429 RATE_LIMITED: too many calls from one address or for one code. @story US-LGN01-001 */
export class RateLimitedException extends AppException {
  constructor(retryAfterSeconds: number) {
    super(429, 'RATE_LIMITED', 'Too many attempts. Please wait and try again', [], { retryAfterSeconds });
  }
}

/** 401 SESSION_ENDED: the refresh token is missing, used twice, or the session is gone. @story US-LGN01-003 @ac AC-US-LGN01-003-02 */
export class SessionEndedException extends AppException {
  constructor() {
    super(401, 'SESSION_ENDED', 'The session has ended. Please sign in again');
  }
}

/** 400 INVALID_STATE: the single sign-on state is unknown or already used. @story US-LGN01-002 */
export class InvalidStateException extends AppException {
  constructor() {
    super(400, 'INVALID_STATE', 'The sign-in request is not valid or has already been used');
  }
}
