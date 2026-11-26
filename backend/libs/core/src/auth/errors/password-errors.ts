/**
 * @file    password-errors.ts
 * @module  AuthCoreModule
 *
 * @description
 * Password exceptions. In plain words: the small typed errors of the password flow.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-003, US-LGN02-002, US-LGN02-004
 * @subtask        ST-LGN02-003-BE-02
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/errors/password-errors.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { AppException, ConflictAppException, FieldError, ValidationFailedException } from '@libs/common';

/** The words of each rule that can be broken (the screens show the same list). */
export const RULE_TEXT: Record<string, string> = {
  MIN_LENGTH: 'Use at least {min} characters',
  UPPER: 'Add an upper-case letter',
  LOWER: 'Add a lower-case letter',
  NUMBER: 'Add a number',
  SYMBOL: 'Add a symbol',
};

/**
 * password-errors.
 *
 * In plain words: the small typed errors of the password flow.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-002, US-LGN02-003, US-LGN02-004
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-003-01, AC-US-LGN02-003-02
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */

/** 422 PASSWORD_POLICY: the password breaks one or more rules; `unmet` lists every rule code that is not met. */
export class PasswordPolicyException extends ValidationFailedException {
  constructor(readonly unmet: string[], minLength = 8) {
    const fields: FieldError[] = unmet.map((rule) => ({ field: 'password', message: (RULE_TEXT[rule] ?? rule).replace('{min}', String(minLength)) }));
    super(fields, 'The password does not meet the rules', 'PASSWORD_POLICY');
  }
}

/** 422 PASSWORD_REUSED: the password is one of the last three. */
export class PasswordReusedException extends ValidationFailedException {
  constructor() {
    super([{ field: 'password', message: 'Choose a password you have not used before' }], 'The password was used before', 'PASSWORD_REUSED');
  }
}

/** 410 LINK_EXPIRED: used, expired and replaced links all look the same to the caller. */
export class LinkExpiredException extends AppException {
  constructor() {
    super(410, 'LINK_EXPIRED', 'This link has expired. Ask for a new one.');
  }
}

/** 422 SAME_AS_TEMPORARY: the new password equals the temporary one. */
export class SameAsTemporaryException extends ValidationFailedException {
  constructor() {
    super([{ field: 'newPassword', message: 'The new password must differ from the temporary one' }], 'The new password must differ from the temporary one', 'SAME_AS_TEMPORARY');
  }
}

/** 409 NOT_REQUIRED: the user does not have to change a temporary password. */
export class NotRequiredException extends ConflictAppException {
  constructor() {
    super('NOT_REQUIRED', 'A password change is not required');
  }
}
