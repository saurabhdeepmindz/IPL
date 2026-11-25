/**
 * @file    already-inactive.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: the user is already Inactive (HTTP 409).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.18 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.18.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/already-inactive.exception.ts
 * @lld-synced     v0.18
 * @status         built
 */

import { ConflictAppException } from '@libs/common';

/**
 * AlreadyInactiveException.
 *
 * In plain words: the user is already Inactive (HTTP 409).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.18 section 6.1
 */
export class AlreadyInactiveException extends ConflictAppException {
  constructor(message = 'The user is already inactive') {
    super('ALREADY_INACTIVE', message);
  }
}
