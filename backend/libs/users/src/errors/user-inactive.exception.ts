/**
 * @file    user-inactive.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: the user is Inactive, so a password cannot be reset or sent (HTTP 409, decision L-55).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/user-inactive.exception.ts
 * @lld-synced     v0.27
 * @status         built
 */

import { ConflictAppException } from '@libs/common';

/**
 * UserInactiveException.
 *
 * In plain words: the user is Inactive, so a password cannot be reset or sent (HTTP 409, decision L-55).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.27 section 6.1
 */
export class UserInactiveException extends ConflictAppException {
  constructor(message = 'The user is inactive, so a password cannot be reset or sent') {
    super('USER_INACTIVE', message);
  }
}
