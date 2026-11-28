/**
 * @file    company-not-allowed.exception.ts
 * @module  AuthCoreModule
 *
 * @description
 * CompanyNotAllowedException. In plain words: 403 COMPANY_NOT_ALLOWED: the company is not one of the user's companies today.@story US-LGN03-002@ac    AC-US-LGN03-002-03
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

import { ForbiddenAppException } from '@libs/common';

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
