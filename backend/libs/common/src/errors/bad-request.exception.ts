/**
 * @file    bad-request.exception.ts
 * @module  CommonModule
 *
 * @description
 * Typed exception for HTTP 400. In plain words: throw it when the request is malformed (cannot be read).
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
 * BadRequestAppException.
 *
 * In plain words: used when the request is malformed (cannot be read).
 *
 * HTTP code: 400. Trigger: the request is malformed (cannot be read). Example: `new BadRequestAppException('BAD_REQUEST', 'Body is not valid JSON')`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   every back-end story
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export class BadRequestAppException extends AppException {
  constructor(code: string, message: string, fields: FieldError[] = []) {
    super(400, code, message, fields);
  }
}
