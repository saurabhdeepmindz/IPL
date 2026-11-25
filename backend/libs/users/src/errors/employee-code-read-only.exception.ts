/**
 * @file    employee-code-read-only.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: the user has signed in, so the employee code can no longer be changed (HTTP 422, decision OP-01).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.16 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.16.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/employee-code-read-only.exception.ts
 * @lld-synced     v0.16
 * @status         built
 */

import { FieldError, ValidationFailedException } from '@libs/common';

/**
 * EmployeeCodeReadOnlyException.
 *
 * In plain words: the user has signed in, so the employee code can no longer be changed (HTTP 422, decision OP-01).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.16 section 6.1
 */
export class EmployeeCodeReadOnlyException extends ValidationFailedException {
  constructor(fields: FieldError[] = []) {
    super(fields, 'The user has signed in, so the employee code can no longer be changed', 'EMPLOYEE_CODE_READ_ONLY');
  }
}
