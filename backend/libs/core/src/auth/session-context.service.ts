/**
 * @file    session-context.service.ts
 * @module  AuthCoreModule
 *
 * @description
 * Session context. In plain words: writes the chosen company and year into the session record and issues a new access token that carries them.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-002
 * @subtask        ST-LGN03-002-BE-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/core/src/auth/session-context.service.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis';
import { SessionUser } from '../authorization/session-user.interface';
import { SessionEndedException } from './errors/auth-errors';
import { REFRESH_SECONDS, SessionRecord } from './session.service';
import { TokenService } from './token.service';

/**
 * SessionContextService.
 *
 * In plain words: the company and year of the session live in the session record in Redis; this class changes them and makes the matching token.
 *
 * @rtm
 *   epics:     EPIC-LGN-03
 *   stories:   US-LGN03-002
 *   workflows: UF-03
 *   frd:       FR-040.2, FR-040.3
 *   contracts: API-ME-02
 *   ac:        AC-US-LGN03-002-01, AC-US-LGN03-002-02
 *   lld:       LLD-EPIC-LGN-03 v0.4 section 6.0
 */
@Injectable()
export class SessionContextService {
  constructor(
    private readonly redis: RedisService,
    private readonly tokens: TokenService,
  ) {}

  /**
   * apply.
   *
   * In plain words: stores the company and year in the session and returns a new 15-minute access token that carries them and the session id. The refresh token is not changed.
   *
   * @epic      EPIC-LGN-03
   * @story     US-LGN03-002
   * @subtask   ST-LGN03-002-BE-02
   * @frd       FR-040.2, FR-040.3
   * @workflow  UF-03
   * @contract  API-ME-02
   * @ac        AC-US-LGN03-002-01, AC-US-LGN03-002-02
   * @lld       LLD-EPIC-LGN-03 v0.4 §6.0
   * @status    built
   *
   * @dependencies RedisService.getJson, RedisService.setJson, TokenService.issueAccess
   *
   * @param sessionId The session to change
   * @param user The signed-in user
   * @param companyCode The company chosen (already checked)
   * @param financialYear The year chosen (already checked)
   * @returns The new access token and its life in seconds
   * @throws SessionEndedException The session no longer exists
   */
  async apply(sessionId: string, user: SessionUser, companyCode: string, financialYear: string): Promise<{ accessToken: string; expiresIn: number }> {
    const record = await this.redis.getJson<SessionRecord>('session:' + sessionId);
    if (!record) throw new SessionEndedException();
    await this.redis.setJson('session:' + sessionId, { ...record, company: companyCode, financialYear } satisfies SessionRecord, REFRESH_SECONDS);
    return this.tokens.issueAccess({
      sub: record.userId,
      emp: record.employeeCode,
      company: companyCode,
      dept: record.departmentId ?? user.departmentId,
      sid: sessionId,
      fy: financialYear,
      ...(record.mustChange ? { mcp: true } : {}),
    });
  }
}
