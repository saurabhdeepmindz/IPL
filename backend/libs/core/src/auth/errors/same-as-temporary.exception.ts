/**
 * @file    same-as-temporary.exception.ts
 * @module  AuthCoreModule
 *
 * @description
 * SameAsTemporaryException. In plain words: 422 SAME_AS_TEMPORARY: the new password equals the temporary one.
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

import { ValidationFailedException } from '@libs/common';

/** 422 SAME_AS_TEMPORARY: the new password equals the temporary one. */
export class SameAsTemporaryException extends ValidationFailedException {
  constructor() {
    super([{ field: 'newPassword', message: 'The new password must differ from the temporary one' }], 'The new password must differ from the temporary one', 'SAME_AS_TEMPORARY');
  }
}
