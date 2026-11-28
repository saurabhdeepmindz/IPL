/**
 * @file    invalid-state.exception.ts
 * @module  AuthCoreModule
 *
 * @description
 * InvalidStateException. In plain words: 400 INVALID_STATE: the single sign-on state is unknown or already used. @story US-LGN01-002
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

/** 400 INVALID_STATE: the single sign-on state is unknown or already used. @story US-LGN01-002 */
export class InvalidStateException extends AppException {
  constructor() {
    super(400, 'INVALID_STATE', 'The sign-in request is not valid or has already been used');
  }
}
