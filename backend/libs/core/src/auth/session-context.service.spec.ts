/**
 * @file    session-context.service.spec.ts
 * @module  AuthCoreModule
 *
 * @description
 * Jest cases of the session context service. In plain words: the chosen company and year are written into the session record, a new access token carries them (and the session id), and a later refresh keeps them.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-002
 * @subtask        ST-LGN03-002-BE-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/core/src/auth/session-context.service.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { JwtService } from '@nestjs/jwt';
import { SessionEndedException } from './errors';
import { FakeRedis, fakeAuditService } from './auth.fakes';
import { SessionContextService } from './session-context.service';
import { SessionService } from './session.service';
import { SignInAuditWriter } from './sign-in-audit.writer';
import { TokenService } from './token.service';

function build() {
  const redis = new FakeRedis();
  const jwt = new JwtService({ secret: 'test-secret' });
  const tokens = new TokenService(jwt);
  const sessions = new SessionService(redis as never, tokens, new SignInAuditWriter(fakeAuditService() as never));
  const context = new SessionContextService(redis as never, tokens);
  return { redis, jwt, sessions, context };
}
const user = { id: 'u1', employeeCode: '10002', fullName: 'A. Kumar', departmentId: 'd1' };
const asSessionUser = (sid: string) => ({ userId: 'u1', employeeCode: '10002', companyCode: '', departmentId: 'd1', sessionId: sid });

describe('SessionContextService (US-LGN03-002)', () => {
  /** @story US-LGN03-002 @ac AC-US-LGN03-002-01 @subtask ST-LGN03-002-BE-02 In plain words: supporting test. apply writes the company and year into the session record and returns a new 15-minute token that carries both and the session id. */
  it('writes the company and year into the session and issues a new token', async () => {
    const { sessions, context, jwt, redis } = build();
    const s = await sessions.create(user);
    const sid = jwt.verify(s.accessToken).sid as string;
    const result = await context.apply(sid, asSessionUser(sid), 'IPL', '2026-27');
    const claims = jwt.verify(result.accessToken);
    expect(claims).toMatchObject({ sub: 'u1', emp: '10002', company: 'IPL', fy: '2026-27', sid, dept: 'd1' });
    expect(claims.mcp).toBeUndefined();
    expect(result.expiresIn).toBe(900);
    expect(redis.store.get('session:' + sid)).toMatchObject({ company: 'IPL', financialYear: '2026-27', userId: 'u1' });
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-02 @subtask ST-LGN03-002-BE-02 In plain words: supporting test. A second choice replaces the first. */
  it('replaces an earlier choice', async () => {
    const { sessions, context, jwt, redis } = build();
    const s = await sessions.create(user);
    const sid = jwt.verify(s.accessToken).sid as string;
    await context.apply(sid, asSessionUser(sid), 'IPL', '2026-27');
    await context.apply(sid, asSessionUser(sid), 'IPLFB', '2025-26');
    expect(redis.store.get('session:' + sid)).toMatchObject({ company: 'IPLFB', financialYear: '2025-26' });
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-01 @subtask ST-LGN03-002-BE-02 In plain words: supporting test. A refresh after the choice keeps the company and the year. */
  it('is kept by a refresh', async () => {
    const { sessions, context, jwt } = build();
    const s = await sessions.create(user);
    const sid = jwt.verify(s.accessToken).sid as string;
    await context.apply(sid, asSessionUser(sid), 'IPLFB', '2026-27');
    const renewed = await sessions.renew(s.refreshToken);
    expect(jwt.verify(renewed.accessToken)).toMatchObject({ company: 'IPLFB', fy: '2026-27', sid });
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-01 @subtask ST-LGN03-002-BE-02 In plain words: supporting test. A session that no longer exists is a 401 SESSION_ENDED. */
  it('refuses a session that has ended', async () => {
    const { context } = build();
    await expect(context.apply('gone', asSessionUser('gone'), 'IPL', '2026-27')).rejects.toBeInstanceOf(SessionEndedException);
  });
});
