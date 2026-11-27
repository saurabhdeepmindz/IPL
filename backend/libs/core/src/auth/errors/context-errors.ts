/**
 * @file    context-errors.ts
 * @module  AuthCoreModule
 *
 * @description
 * Context exceptions. In plain words: the small typed errors of choosing a company and year: a company the user does not have today (403) and a year that is not in the list (422).
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-002
 * @subtask        ST-LGN03-002-BE-02
 * @lld            LLD-EPIC-LGN-03 v0.2 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/core/src/auth/errors/context-errors.ts
 * @lld-synced     v0.2
 * @status         built
 */

import { ForbiddenAppException, ValidationFailedException } from '@libs/common';

/**
 * 403 COMPANY_NOT_ALLOWED: the company is not one of the user's companies today.
 *
 * @story US-LGN03-002
 * @ac    AC-US-LGN03-002-03
 */
export class CompanyNotAllowedException extends ForbiddenAppException {
  constructor() {
    super('COMPANY_NOT_ALLOWED', 'You do not have access to this company.');
  }
}

/**
 * 422 INVALID_YEAR: the financial year is not in the list.
 *
 * @story US-LGN03-002
 * @ac    AC-US-LGN03-002-01
 */
export class InvalidYearException extends ValidationFailedException {
  constructor() {
    super([{ field: 'financialYear', message: 'Choose one of the financial years in the list' }], 'The financial year is not in the list', 'INVALID_YEAR');
  }
}
