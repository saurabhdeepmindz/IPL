/**
 * @file    duplicate-employee-code.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: the employee code is already used (HTTP 409).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.22 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.22.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/duplicate-employee-code.exception.ts
 * @lld-synced     v0.22
 * @status         built
 */

import { ConflictAppException } from '@libs/common';

/**
 * DuplicateEmployeeCodeException.
 *
 * In plain words: the employee code is already used (HTTP 409).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.22 section 6.1
 */
export class DuplicateEmployeeCodeException extends ConflictAppException {
  constructor(message = 'The employee code is already used') {
    super('DUPLICATE_EMPLOYEE_CODE', message);
  }
}
