/**
 * @file    already-signed-in.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: the user has already signed in, so the one-time password cannot be sent again (HTTP 422).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.15 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.15.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/already-signed-in.exception.ts
 * @lld-synced     v0.15
 * @status         built
 */

import { FieldError, ValidationFailedException } from '@libs/common';

/**
 * AlreadySignedInException.
 *
 * In plain words: the user has already signed in, so the one-time password cannot be sent again (HTTP 422).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.15 section 6.1
 */
export class AlreadySignedInException extends ValidationFailedException {
  constructor(fields: FieldError[] = []) {
    super(fields, 'The user has already signed in, so the one-time password cannot be sent again', 'ALREADY_SIGNED_IN');
  }
}
