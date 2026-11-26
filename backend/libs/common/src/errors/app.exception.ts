/**
 * @file    app.exception.ts
 * @module  CommonModule
 *
 * @description
 * Base class of every typed failure. In plain words: a failure that carries a code, a message and, for forms, a list of field errors.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-04
 */

import { HttpException } from '@nestjs/common';

/** One field-level problem, for example the e-mail address is not valid. */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Base typed exception.
 *
 * In plain words: throw a subclass; the global filter turns it into the failure body.
 *
 * HTTP code: set by the subclass. Trigger: any business or access failure. Example: `throw new NotFoundAppException('USER_NOT_FOUND', 'No such user')`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   every back-end story
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export class AppException extends HttpException {
  constructor(
    status: number,
    readonly code: string,
    message: string,
    readonly fields: FieldError[] = [],
    readonly details?: Record<string, unknown>,
  ) {
    super({ code, message, fields, ...(details ? { details } : {}) }, status);
  }
}
