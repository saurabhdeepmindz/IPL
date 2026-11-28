/**
 * @file    account-inactive.exception.ts
 * @module  AuthCoreModule
 *
 * @description
 * AccountInactiveException. In plain words: 403 ACCOUNT_INACTIVE: the user is deactivated. @story US-LGN01-001 @ac AC-US-LGN01-001-07
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

/** 403 ACCOUNT_INACTIVE: the user is deactivated. @story US-LGN01-001 @ac AC-US-LGN01-001-07 */
export class AccountInactiveException extends AppException {
  constructor(reference: string) {
    super(403, 'ACCOUNT_INACTIVE', 'This account is not active. Please contact the helpdesk and quote the reference', [], { reference });
  }
}
