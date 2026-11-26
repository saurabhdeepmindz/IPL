/**
 * @file    session.service.ts
 * @module  AuthCoreModule
 *
 * @description
 * Sessions. In plain words: creates the session record at sign-in and renews the access token from the refresh cookie, ending the session when a cookie is used twice.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-003, US-LGN01-001
 * @subtask        ST-LGN01-003-BE-02
 * @contract       API-AUTH-04
 * @lld            LLD-EPIC-LGN-01 v0.3 §6.3
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/session.service.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis';
import { randomUUID } from 'node:crypto';
import { TokenService } from './token.service';
import { SignInAuditWriter } from './sign-in-audit.writer';
import { SessionTokens, SessionUserInput } from './sign-in.types';
import { SessionEndedException } from './errors/auth-errors';

const REFRESH_SECONDS = 8 * 60 * 60;

interface SessionRecord {
  userId: string;
  employeeCode: string;
  departmentId: string | null;
  company: string;
  refreshHash: string;
}

interface RefreshRecord {
  sid: string;
  used: boolean;
}

/**
 * SessionService.
 *
 * In plain words: the session record in Redis (the idle clock and the end are in EPIC-LGN-04)
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-001, US-LGN01-003
   *   workflows: UF-01
   *   contracts: API-AUTH-04
   *   ac:        AC-US-LGN01-003-01, AC-US-LGN01-003-02
   *   lld:       LLD-EPIC-LGN-01 v0.3 section 6.3
 */
@Injectable()
export class SessionService {
  constructor(
    private readonly redis: RedisService,
    private readonly tokens: TokenService,
    private readonly audit: SignInAuditWriter,
  ) {}

  /**
   * create.
   *
   * In plain words: starts a session and issues the tokens
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-003
   * @subtask   ST-LGN01-003-BE-02
   * @workflow  UF-01
   * @contract  API-AUTH-04
   * @ac        AC-US-LGN01-003-01
   * @lld       LLD-EPIC-LGN-01 v0.3 §6.3
   * @status    built
   *
   * @dependencies RedisService.setJson, TokenService.issueAccess, TokenService.newRefresh
   *
   * @returns Promise<{ accessToken: string; refreshToken: string; refreshSeconds: number; expiresIn: number }>
   */
  async create(user: SessionUserInput): Promise<SessionTokens> {
    const sid = randomUUID();
    const refresh = this.tokens.newRefresh();
    const record: SessionRecord = { userId: user.id, employeeCode: user.employeeCode, departmentId: user.departmentId, company: '', refreshHash: refresh.hash };
    await this.redis.setJson('session:' + sid, record, REFRESH_SECONDS);
    await this.redis.setJson('refresh:' + refresh.hash, { sid, used: false } satisfies RefreshRecord, REFRESH_SECONDS);
    const known = (await this.redis.getJson<string[]>('usersessions:' + user.id)) ?? [];
    await this.redis.setJson('usersessions:' + user.id, [...known.slice(-9), sid], REFRESH_SECONDS);
    const access = await this.tokens.issueAccess({ sub: user.id, emp: user.employeeCode, company: '', dept: user.departmentId, sid });
    return { accessToken: access.accessToken, refreshToken: refresh.token, refreshSeconds: REFRESH_SECONDS, expiresIn: access.expiresIn };
  }

  /**
   * renew.
   *
   * In plain words: renews the access token and rotates the refresh token
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-003
   * @subtask   ST-LGN01-003-BE-02
   * @workflow  UF-01
   * @contract  API-AUTH-04
   * @ac        AC-US-LGN01-003-02
   * @lld       LLD-EPIC-LGN-01 v0.3 §6.3
   * @status    built
   *
   * @dependencies TokenService.hash, RedisService.getJson, RedisService.setJson, SessionEndedException
   *
   * @returns Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>
   * @throws SessionEndedException
   */
  async renew(refreshToken: string | undefined): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    if (!refreshToken) throw new SessionEndedException();
    const hash = this.tokens.hash(refreshToken);
    const entry = await this.redis.getJson<RefreshRecord>('refresh:' + hash);
    if (!entry) throw new SessionEndedException();
    const session = await this.redis.getJson<SessionRecord>('session:' + entry.sid);
    if (!session) throw new SessionEndedException();
    if (entry.used) {
      await this.redis.deleteKey('session:' + entry.sid);
      await this.redis.deleteKey('refresh:' + session.refreshHash);
      await this.audit.record({ kind: 'SESSION', employeeCode: session.employeeCode, result: 'SESSION_REUSE', userId: session.userId });
      throw new SessionEndedException();
    }
    await this.redis.setJson('refresh:' + hash, { sid: entry.sid, used: true } satisfies RefreshRecord, REFRESH_SECONDS);
    const next = this.tokens.newRefresh();
    await this.redis.setJson('refresh:' + next.hash, { sid: entry.sid, used: false } satisfies RefreshRecord, REFRESH_SECONDS);
    await this.redis.setJson('session:' + entry.sid, { ...session, refreshHash: next.hash }, REFRESH_SECONDS);
    const access = await this.tokens.issueAccess({ sub: session.userId, emp: session.employeeCode, company: session.company, dept: session.departmentId, sid: entry.sid });
    return { accessToken: access.accessToken, refreshToken: next.token, expiresIn: access.expiresIn };
  }
}
