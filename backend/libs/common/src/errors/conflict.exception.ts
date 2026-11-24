/**
 * @file    conflict.exception.ts
 * @module  CommonModule
 *
 * @description
 * Typed exception for HTTP 409. In plain words: throw it when the change clashes with the current state, for example a duplicate or a stale matrixVersion.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-04
 */

import { AppException, FieldError } from './app.exception';

/**
 * ConflictAppException.
 *
 * In plain words: used when the change clashes with the current state, for example a duplicate or a stale matrixVersion.
 *
 * HTTP code: 409. Trigger: the change clashes with the current state, for example a duplicate or a stale matrixVersion. Example: `new ConflictAppException('MATRIX_VERSION_STALE', 'Reload and try again')`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   every back-end story
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export class ConflictAppException extends AppException {
  constructor(code: string, message: string, fields: FieldError[] = []) {
    super(409, code, message, fields);
  }
}
