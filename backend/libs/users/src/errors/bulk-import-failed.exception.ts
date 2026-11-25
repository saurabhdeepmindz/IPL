/**
 * @file    bulk-import-failed.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: no row of the import is valid; carries the error report (HTTP 422).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-01
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/bulk-import-failed.exception.ts
 * @lld-synced     v0.19
 * @status         built
 */

import { FieldError, ValidationFailedException } from '@libs/common';

/**
 * BulkImportFailedException.
 *
 * In plain words: no row of the import is valid; carries the error report (HTTP 422).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-009
 *   workflows: AD-03
 *   frd:       FR-042.2
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.19 section 6.1
 */
export class BulkImportFailedException extends ValidationFailedException {
  constructor(fields: FieldError[] = []) {
    super(fields, 'No row of the import is valid', 'BULK_IMPORT_FAILED');
  }
}
