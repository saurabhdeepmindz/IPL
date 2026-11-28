/**
 * @file    session-ended.exception.ts
 * @module  AuthCoreModule
 *
 * @description
 * SessionEndedException. In plain words: 401 SESSION_ENDED: the refresh token is missing, used twice, or the session is gone. @story US-LGN01-003 @ac AC-US-LGN01-003-02
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

/** 401 SESSION_ENDED: the refresh token is missing, used twice, or the session is gone. @story US-LGN01-003 @ac AC-US-LGN01-003-02 */
export class SessionEndedException extends AppException {
  constructor() {
    super(401, 'SESSION_ENDED', 'The session has ended. Please sign in again');
  }
}
