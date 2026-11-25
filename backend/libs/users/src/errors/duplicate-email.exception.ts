/**
 * @file    duplicate-email.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: the e-mail is already used (HTTP 409).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/duplicate-email.exception.ts
 * @lld-synced     v0.26
 * @status         built
 */

import { ConflictAppException } from '@libs/common';

/**
 * DuplicateEmailException.
 *
 * In plain words: the e-mail is already used (HTTP 409).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.26 section 6.1
 */
export class DuplicateEmailException extends ConflictAppException {
  constructor(message = 'The e-mail is already used') {
    super('DUPLICATE_EMAIL', message);
  }
}
