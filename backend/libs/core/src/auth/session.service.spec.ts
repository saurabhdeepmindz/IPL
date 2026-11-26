/**
 * @file    session.service.spec.ts
 * @module  Tests
 *
 * @description
 * Jest cases of US-LGN01-003 (System starts the session at sign-in and renews the access token). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-003
 * @subtask        ST-LGN01-003-BE-03
 * @lld            LLD-EPIC-LGN-01 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/session.service.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';
import { SignInAuditWriter } from './sign-in-audit.writer';
import { TokenService } from './token.service';
import { SessionEndedException } from './errors/auth-errors';
import { FakeRedis, fakeAuditService } from './auth.fakes';

function build() {
  const redis = new FakeRedis();
  const audit = fakeAuditService();
  const jwt = new JwtService({ secret: 'test-secret' });
  const svc = new SessionService(redis as never, new TokenService(jwt), new SignInAuditWriter(audit as never));
  return { svc, redis, audit, jwt };
}
const user = { id: 'u1', employeeCode: '10002', fullName: 'A. Kumar', departmentId: 'd1' };

describe('System keeps the session and renews the access token (US-LGN01-003)', () => {
  /** @tc TC-LGN01-003-J01 @story US-LGN01-003 @ac AC-US-LGN01-003-01 @subtask ST-LGN01-003-BE-03 */
  it('TC-LGN01-003-J01 a started session gives a 15-minute access token and a rotating 8-hour refresh token stored only as a hash', async () => {
    const { svc, redis, jwt } = build();
    const s = await svc.create(user);
    expect(s.expiresIn).toBe(900);
    expect(s.refreshSeconds).toBe(8 * 3600);
    const claims = jwt.verify(s.accessToken);
    expect(claims.sub).toBe('u1');
    expect(claims.emp).toBe('10002');
    expect(claims.sid).toEqual(expect.any(String));
    expect(claims.exp - claims.iat).toBe(900);
    expect(JSON.stringify([...redis.store.entries()])).not.toContain(s.refreshToken);
  });

  /** @tc TC-LGN01-003-J02 @story US-LGN01-003 @ac AC-US-LGN01-003-02 @subtask ST-LGN01-003-BE-03 */
  it('TC-LGN01-003-J02 a valid refresh token gives a new access token and a new refresh token; the old one ends the session when used again', async () => {
    const { svc, audit, jwt } = build();
    const s = await svc.create(user);
    const r = await svc.renew(s.refreshToken);
    expect(jwt.verify(r.accessToken).sid).toBe(jwt.verify(s.accessToken).sid);
    expect(r.refreshToken).not.toBe(s.refreshToken);
    await expect(svc.renew(s.refreshToken)).rejects.toBeInstanceOf(SessionEndedException);
    await expect(svc.renew(r.refreshToken)).rejects.toBeInstanceOf(SessionEndedException);
    expect(JSON.stringify(audit.rows)).toContain('SESSION_REUSE');
  });

  it('a missing or unknown refresh token is a 401 SESSION_ENDED', async () => {
    const { svc } = build();
    const e = await svc.renew(undefined).catch((x) => x);
    expect(e).toBeInstanceOf(SessionEndedException);
    expect(e.getStatus()).toBe(401);
    await expect(svc.renew('not-a-token')).rejects.toBeInstanceOf(SessionEndedException);
  });
});
