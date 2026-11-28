/**
 * @file    link-expired.exception.ts
 * @module  AuthCoreModule
 *
 * @description
 * LinkExpiredException. In plain words: 410 LINK_EXPIRED: used, expired and replaced links all look the same to the caller.
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

import { AppException } from '@libs/common';

/** 410 LINK_EXPIRED: used, expired and replaced links all look the same to the caller. */
export class LinkExpiredException extends AppException {
  constructor() {
    super(410, 'LINK_EXPIRED', 'This link has expired. Ask for a new one.');
  }
}
