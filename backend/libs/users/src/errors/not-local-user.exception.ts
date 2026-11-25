/**
 * @file    not-local-user.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: only local-sign-in users have passwords (HTTP 422).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/not-local-user.exception.ts
 * @lld-synced     v0.19
 * @status         built
 */

import { FieldError, ValidationFailedException } from '@libs/common';

/**
 * NotLocalUserException.
 *
 * In plain words: only local-sign-in users have passwords (HTTP 422).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.19 section 6.1
 */
export class NotLocalUserException extends ValidationFailedException {
  constructor(fields: FieldError[] = []) {
    super(fields, 'Only local-sign-in users have passwords', 'NOT_LOCAL_USER');
  }
}
