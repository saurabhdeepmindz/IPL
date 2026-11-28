/**
 * @file    rate-limited.exception.ts
 * @module  AuthCoreModule
 *
 * @description
 * RateLimitedException. In plain words: 429 RATE_LIMITED: too many calls from one address or for one code. @story US-LGN01-001
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

/** 429 RATE_LIMITED: too many calls from one address or for one code. @story US-LGN01-001 */
export class RateLimitedException extends AppException {
  constructor(retryAfterSeconds: number) {
    super(429, 'RATE_LIMITED', 'Too many attempts. Please wait and try again', [], { retryAfterSeconds });
  }
}
