/**
 * @file    unauthenticated.exception.ts
 * @module  CommonModule
 *
 * @description
 * Typed exception for HTTP 401. In plain words: throw it when the caller is not signed in or the token is not valid.
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
 * UnauthenticatedAppException.
 *
 * In plain words: used when the caller is not signed in or the token is not valid.
 *
 * HTTP code: 401. Trigger: the caller is not signed in or the token is not valid. Example: `new UnauthenticatedAppException('UNAUTHENTICATED', 'Sign in again')`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   every back-end story
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export class UnauthenticatedAppException extends AppException {
  constructor(code: string, message: string, fields: FieldError[] = []) {
    super(401, code, message, fields);
  }
}
