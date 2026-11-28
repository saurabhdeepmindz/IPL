/**
 * @file    invalid-year.exception.ts
 * @module  AuthCoreModule
 *
 * @description
 * InvalidYearException. In plain words: 422 INVALID_YEAR: the financial year is not in the list.@story US-LGN03-002@ac    AC-US-LGN03-002-01
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-002
 * @subtask        ST-LGN03-002-BE-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/core/src/auth/errors/context-errors.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { ValidationFailedException } from '@libs/common';

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
