/**
 * @file    not-locked.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: the user is not Locked, so there is nothing to unlock (HTTP 409).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.17 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.17.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/not-locked.exception.ts
 * @lld-synced     v0.17
 * @status         built
 */

import { ConflictAppException } from '@libs/common';

/**
 * NotLockedException.
 *
 * In plain words: the user is not Locked, so there is nothing to unlock (HTTP 409).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.17 section 6.1
 */
export class NotLockedException extends ConflictAppException {
  constructor(message = 'The user is not locked, so there is nothing to unlock') {
    super('NOT_LOCKED', message);
  }
}
