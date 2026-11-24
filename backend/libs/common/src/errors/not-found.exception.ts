/**
 * @file    not-found.exception.ts
 * @module  CommonModule
 *
 * @description
 * Typed exception for HTTP 404. In plain words: throw it when the record asked for does not exist (or is hidden from this company).
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
 * NotFoundAppException.
 *
 * In plain words: used when the record asked for does not exist (or is hidden from this company).
 *
 * HTTP code: 404. Trigger: the record asked for does not exist (or is hidden from this company). Example: `new NotFoundAppException('USER_NOT_FOUND', 'No such user')`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   every back-end story
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export class NotFoundAppException extends AppException {
  constructor(code: string, message: string, fields: FieldError[] = []) {
    super(404, code, message, fields);
  }
}
