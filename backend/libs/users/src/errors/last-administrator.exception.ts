/**
 * @file    last-administrator.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: this is the last active Administrator, so it cannot be deactivated (HTTP 422).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.22 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.22.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/last-administrator.exception.ts
 * @lld-synced     v0.22
 * @status         built
 */

import { FieldError, ValidationFailedException } from '@libs/common';

/**
 * LastAdministratorException.
 *
 * In plain words: this is the last active Administrator, so it cannot be deactivated (HTTP 422).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.22 section 6.1
 */
export class LastAdministratorException extends ValidationFailedException {
  constructor(fields: FieldError[] = []) {
    super(fields, 'This is the last active administrator, so it cannot be deactivated', 'LAST_ADMINISTRATOR');
  }
}
