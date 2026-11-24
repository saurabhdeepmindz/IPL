/**
 * @file    global-exception.filter.ts
 * @module  CommonModule
 *
 * @description
 * Turns every failure into the standard failure body. In plain words: a typed exception keeps its code and status; anything unknown becomes a 500 with no detail in the body and the stack in the log.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-04
 */

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import type { FailureBody } from '../response/api-response';

const CODE_BY_STATUS: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_FAILED',
};

/**
 * Global exception filter.
 *
 * In plain words: whatever goes wrong, the caller gets `{ error: { code, message, fields } }`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   every back-end story
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  /**
   * Handle one failure.
   *
   * In plain words: picks the status and the body, logs unknown errors with their stack.
   *
   * @param exception What was thrown
   * @param host The request context
   * @returns Nothing (writes the response)
   * @dependencies Logger.error
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();
      const obj = typeof raw === 'string' ? { message: raw } : (raw as Record<string, unknown>);
      const body: FailureBody = {
        error: {
          code: (obj.code as string) ?? CODE_BY_STATUS[status] ?? 'ERROR',
          message: Array.isArray(obj.message) ? obj.message.join('; ') : ((obj.message as string) ?? exception.message),
          fields: (obj.fields as FailureBody['error']['fields']) ?? [],
        },
      };
      res.status(status).json(body);
      return;
    }
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    const body: FailureBody = {
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.', fields: [] },
    };
    res.status(500).json(body);
  }
}
