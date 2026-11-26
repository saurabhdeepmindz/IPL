/**
 * @file    local-sign-in.service.spec.ts
 * @module  Tests
 *
 * @description
 * Jest cases of US-LGN01-001 (System signs a user in with employee code and password). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001
 * @subtask        ST-LGN01-001-BE-04
 * @lld            LLD-EPIC-LGN-01 v0.3 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/local-sign-in.service.spec.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { SignInAuditWriter } from './sign-in-audit.writer';
import { AccountLockPolicy } from './account-lock.policy';
import { LocalSignInService } from './local-sign-in.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { AccountInactiveException, AccountLockedException, InvalidCredentialsException, RateLimitedException } from './errors/auth-errors';
import { FakeHasher, FakeRedis, FakeUserStore, fakeAuditService, makeCredentials } from './auth.fakes';
import { JwtService } from '@nestjs/jwt';
import { RateLimiterService } from '@libs/security';
import { SettingsService } from '@libs/settings';
import { ConfigService } from '@nestjs/config';

function build(user = makeCredentials(), limit?: { hit: jest.Mock }) {
  const redis = new FakeRedis();
  const audit = fakeAuditService();
  const writer = new SignInAuditWriter(audit as never);
  const tokens = new TokenService(new JwtService({ secret: 'test-secret' }));
  const sessions = new SessionService(redis as never, tokens, writer);
  const store = new FakeUserStore(user);
  const rates = (limit ?? new RateLimiterService(redis as never)) as unknown as RateLimiterService;
  const svc = new LocalSignInService(rates, store as never, store as never, new FakeHasher() as never, new AccountLockPolicy(), sessions, writer, new SettingsService(new ConfigService({})));
  return { svc, audit, redis, store };
}

const good = { employeeCode: '10002', password: 'secret-pass' };

describe('System signs a user in with employee code and password (US-LGN01-001)', () => {
  afterEach(() => jest.useRealTimers());

  /** @tc TC-LGN01-001-J01 @story US-LGN01-001 @ac AC-US-LGN01-001-01 @subtask ST-LGN01-001-BE-04 */
  it('TC-LGN01-001-J01 the right code and password start a session and name the next step', async () => {
    const { svc, store, redis } = build();
    const r = await svc.signIn(good, '10.0.0.1');
    expect(r.nextStep).toBe('CHOOSE_WORK');
    expect(r.accessToken.split('.')).toHaveLength(3);
    expect(r.refreshSeconds).toBe(8 * 3600);
    expect(store.calls).toEqual(expect.arrayContaining(['clear', 'times']));
    expect([...redis.store.keys()].some((k) => k.startsWith('session:'))).toBe(true);
  });

  it('a user who must change the password is sent to the change-password step', async () => {
    const { svc } = build(makeCredentials({ mustChangePassword: true }));
    expect((await svc.signIn(good, 'a')).nextStep).toBe('CHANGE_PASSWORD');
  });

  /** @tc TC-LGN01-001-J02 @story US-LGN01-001 @ac AC-US-LGN01-001-02 @subtask ST-LGN01-001-BE-04 */
  it('TC-LGN01-001-J02 one audit record per attempt with the code as typed, the result and the address, never the password', async () => {
    const { svc, audit } = build();
    await svc.signIn(good, '10.0.0.9');
    await expect(svc.signIn({ employeeCode: '10002', password: 'wrong' }, '10.0.0.9')).rejects.toBeInstanceOf(InvalidCredentialsException);
    expect(audit.rows).toHaveLength(2);
    expect(audit.rows[0].entityKey).toBe('10002');
    expect(JSON.stringify(audit.rows[0].after)).toContain('SUCCESS');
    expect(JSON.stringify(audit.rows[1].after)).toContain('INVALID_CREDENTIALS');
    expect(JSON.stringify(audit.rows[1].after)).toContain('10.0.0.9');
    expect(JSON.stringify(audit.rows)).not.toContain('secret-pass');
    expect(JSON.stringify(audit.rows)).not.toContain('wrong');
  });

  /** @tc TC-LGN01-001-J03 @story US-LGN01-001 @ac AC-US-LGN01-001-03 @subtask ST-LGN01-001-BE-04 */
  it('TC-LGN01-001-J03 a correct password finishes in one call: no second factor step exists', async () => {
    const { svc } = build();
    const r = await svc.signIn(good, 'a');
    expect(['CHOOSE_WORK', 'CHANGE_PASSWORD']).toContain(r.nextStep);
    expect(Object.keys(r)).not.toContain('otpRequired');
  });

  /** @tc TC-LGN01-001-J04 @story US-LGN01-001 @ac AC-US-LGN01-001-04 @subtask ST-LGN01-001-BE-04 */
  it('TC-LGN01-001-J04 a wrong code and a wrong password give the same 401 answer', async () => {
    const a = build();
    const b = build();
    const e1 = await a.svc.signIn({ employeeCode: '99999', password: 'x' }, 'a').catch((e) => e);
    const e2 = await b.svc.signIn({ employeeCode: '10002', password: 'x' }, 'a').catch((e) => e);
    expect(e1).toBeInstanceOf(InvalidCredentialsException);
    expect(e2).toBeInstanceOf(InvalidCredentialsException);
    expect(e1.getStatus()).toBe(401);
    expect(e1.code).toBe(e2.code);
    expect(e1.message).toBe(e2.message);
    expect(e1.details).toEqual(e2.details);
  });

  /** @tc TC-LGN01-001-J05 @story US-LGN01-001 @ac AC-US-LGN01-001-05 @subtask ST-LGN01-001-BE-04 */
  it('TC-LGN01-001-J05 the 5th failure locks the account for 15 minutes and the answer carries the lock time and a reference', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setTimeout'] }).setSystemTime(new Date('2026-11-26T10:00:00Z'));
    const { svc } = build(makeCredentials({ failedAttempts: 0 }));
    const bad = { employeeCode: '10002', password: 'nope' };
    for (let i = 0; i < 4; i++) {
      const e = await svc.signIn(bad, 'a').catch((x) => x);
      expect(e).toBeInstanceOf(InvalidCredentialsException);
      expect(e.details.attemptsLeft).toBe(4 - i);
    }
    const locked = await svc.signIn(bad, 'a').catch((x) => x);
    expect(locked).toBeInstanceOf(AccountLockedException);
    expect(locked.getStatus()).toBe(423);
    expect(locked.details.lockedUntil).toBe('2026-11-26T10:15:00.000Z');
    expect(locked.details.reference).toMatch(/^LCK-\d{4}-[A-Z0-9]{4}$/);
  });

  /** @tc TC-LGN01-001-J06 @story US-LGN01-001 @ac AC-US-LGN01-001-06 @subtask ST-LGN01-001-BE-04 */
  it('TC-LGN01-001-J06 a locked account refuses a right password until 15 minutes pass; then the sign-in works and the counter is cleared', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setTimeout'] }).setSystemTime(new Date('2026-11-26T10:00:00Z'));
    const { svc, store } = build(makeCredentials({ status: 'LOCKED', failedAttempts: 5, lockedUntil: new Date('2026-11-26T10:15:00Z') }));
    await expect(svc.signIn(good, 'a')).rejects.toBeInstanceOf(AccountLockedException);
    jest.setSystemTime(new Date('2026-11-26T10:16:00Z'));
    const r = await svc.signIn(good, 'a');
    expect(r.nextStep).toBe('CHOOSE_WORK');
    expect(store.calls).toContain('clear');
  });

  /** @tc TC-LGN01-001-J07 @story US-LGN01-001 @ac AC-US-LGN01-001-07 @subtask ST-LGN01-001-BE-04 */
  it('TC-LGN01-001-J07 a deactivated user gets 403 ACCOUNT_INACTIVE with a reference', async () => {
    const { svc } = build(makeCredentials({ status: 'INACTIVE' }));
    const e = await svc.signIn(good, 'a').catch((x) => x);
    expect(e).toBeInstanceOf(AccountInactiveException);
    expect(e.getStatus()).toBe(403);
    expect(e.code).toBe('ACCOUNT_INACTIVE');
    expect(e.details.reference).toMatch(/^INA-\d{4}-[A-Z0-9]{4}$/);
  });

  it('a call over the rate limit is refused with 429 and the seconds to wait', async () => {
    const { svc } = build(makeCredentials(), { hit: jest.fn().mockResolvedValue({ allowed: false, retryAfterSeconds: 42 }) });
    const e = await svc.signIn(good, 'a').catch((x) => x);
    expect(e).toBeInstanceOf(RateLimitedException);
    expect(e.getStatus()).toBe(429);
    expect(e.details.retryAfterSeconds).toBe(42);
  });
});
