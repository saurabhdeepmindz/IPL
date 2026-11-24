/**
 * @file    validation-failed.exception.ts
 * @module  CommonModule
 *
 * @description
 * Typed exception for HTTP 422. In plain words: throw it when a rule is broken or one or more fields are invalid.
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
 * ValidationFailedException.
 *
 * In plain words: the caller sent data that breaks a rule; every field problem is returned together.
 *
 * HTTP code: 422. Trigger: a rule is broken or one or more fields are invalid. Example: `new ValidationFailedException([{ field: 'email', message: 'must be an e-mail' }])`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   every back-end story
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export class ValidationFailedException extends AppException {
  constructor(fields: FieldError[], message = 'One or more fields are not valid', code = 'VALIDATION_FAILED') {
    super(422, code, message, fields);
  }
}
