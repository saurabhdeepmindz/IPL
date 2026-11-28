/**
 * @file    password-policy.exception.ts
 * @module  AuthCoreModule
 *
 * @description
 * PasswordPolicyException. In plain words: 422 PASSWORD_POLICY: the password breaks one or more rules; `unmet` lists every rule code that is not met.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-003, US-LGN02-002, US-LGN02-004
 * @subtask        ST-LGN02-003-BE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/errors/password-errors.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { FieldError, ValidationFailedException } from '@libs/common';

/** The words of each rule that can be broken (the screens show the same list). */
export const RULE_TEXT: Record<string, string> = {
  MIN_LENGTH: 'Use at least {min} characters',
  UPPER: 'Add an upper-case letter',
  LOWER: 'Add a lower-case letter',
  NUMBER: 'Add a number',
  SYMBOL: 'Add a symbol',
};

/** 422 PASSWORD_POLICY: the password breaks one or more rules; `unmet` lists every rule code that is not met. */
export class PasswordPolicyException extends ValidationFailedException {
  constructor(readonly unmet: string[], minLength = 8) {
    const fields: FieldError[] = unmet.map((rule) => ({ field: 'password', message: (RULE_TEXT[rule] ?? rule).replace('{min}', String(minLength)) }));
    super(fields, 'The password does not meet the rules', 'PASSWORD_POLICY');
  }
}
