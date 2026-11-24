/**
 * @file    forbidden.exception.ts
 * @module  CommonModule
 *
 * @description
 * Typed exception for HTTP 403. In plain words: throw it when the caller is signed in but is not allowed.
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
 * ForbiddenAppException.
 *
 * In plain words: used when the caller is signed in but is not allowed.
 *
 * HTTP code: 403. Trigger: the caller is signed in but is not allowed. Example: `new ForbiddenAppException('FORBIDDEN', 'You do not have this right')`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   every back-end story
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export class ForbiddenAppException extends AppException {
  constructor(code: string, message: string, fields: FieldError[] = []) {
    super(403, code, message, fields);
  }
}
