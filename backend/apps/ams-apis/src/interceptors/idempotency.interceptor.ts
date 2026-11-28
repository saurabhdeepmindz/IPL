/**
 * @file    idempotency.interceptor.ts
 * @module  UsersApi
 *
 * @description
 * Idempotency of a create. In plain words: a repeated click with the same `Idempotency-Key` does not create twice; the first answer is returned (decision L-49).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/interceptors/idempotency.interceptor.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ValidationFailedException } from '@libs/common';
import { RedisService } from '@libs/infrastructure';

/**
 * Idempotency interceptor.
 *
 * In plain words: remembers the answer of a create for 24 hours under its key.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 *   contracts: API-USR-02
 *   lld:       LLD-EPIC-ADM-01 v0.29 section 6.1
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly redis: RedisService,
  ) {}

  /**
   * Intercepts a call.
   *
   * In plain words: returns the remembered answer for a key it has seen, otherwise lets the call run and remembers its answer.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-01
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02
 * @ac        AC-US003-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies RedisService.getJson, setJson
   *
   * @param context - the call
   * @param next - the rest of the call
   * @returns The answer, new or remembered
   * @throws ValidationFailedException - the header is missing (HTTP 422, field Idempotency-Key)
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; user: { userId: string } }>();
    const header = req.headers['idempotency-key'];
    if (!header || header.length > 100) {
      throw new ValidationFailedException([{ field: 'Idempotency-Key', message: 'Send an Idempotency-Key header (up to 100 characters)' }]);
    }
    const key = `idem:users:${req.user.userId}:${header}`;
    return from(this.remembered(key)).pipe(
      mergeMap((answer) => (answer ? of(answer) : next.handle().pipe(mergeMap(async (body) => (await this.remember(key, body), body))))),
    );
  }

  /** The answer remembered for a key, or null; a Redis fault never blocks the call. */
  private async remembered(key: string): Promise<unknown> {
    return this.redis.getJson(key).catch(() => null);
  }

  /** Remembers the answer of a successful call for 24 hours; a Redis fault is ignored. */
  private async remember(key: string, body: unknown): Promise<void> {
    await this.redis.setJson(key, body, 24 * 60 * 60).catch(() => undefined);
  }
}
