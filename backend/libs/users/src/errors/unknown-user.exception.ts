/**
 * @file    unknown-user.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: no user has this employee code (HTTP 404).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/unknown-user.exception.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { NotFoundAppException } from '@libs/common';

/**
 * UnknownUserException.
 *
 * In plain words: no user has this employee code (HTTP 404).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.29 section 6.1
 */
export class UnknownUserException extends NotFoundAppException {
  constructor(message = 'No user has this employee code') {
    super('USER_NOT_FOUND', message);
  }
}
