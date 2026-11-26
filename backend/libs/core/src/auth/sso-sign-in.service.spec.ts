/**
 * @file    sso-sign-in.service.spec.ts
 * @module  Tests
 *
 * @description
 * Jest cases of US-LGN01-002 (System signs a user in through single sign-on). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-002
 * @subtask        ST-LGN01-002-BE-04
 * @lld            LLD-EPIC-LGN-01 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/sso-sign-in.service.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { chooseProvider, TestIdentityProvider } from '@libs/integrations';
import { SessionService } from './session.service';
import { SignInAuditWriter } from './sign-in-audit.writer';
import { SsoSignInService } from './sso-sign-in.service';
import { SsoStateStore } from './sso-state.store';
import { TokenService } from './token.service';
import { FakeRedis, FakeUserStore, fakeAuditService, makeCredentials } from './auth.fakes';

function build(account: string, user = makeCredentials({ authType: 'SSO', passwordHash: null })) {
  const redis = new FakeRedis();
  const audit = fakeAuditService();
  const writer = new SignInAuditWriter(audit as never);
  const sessions = new SessionService(redis as never, new TokenService(new JwtService({ secret: 'test-secret' })), writer);
  const idp = new TestIdentityProvider(new ConfigService({ IDP_STUB_ACCOUNT: account }));
  const svc = new SsoSignInService(new SsoStateStore(redis as never), idp, new FakeUserStore(user) as never, sessions, writer);
  return { svc, audit, redis };
}

/** Walks the stub round trip: start, follow the address, complete. */
async function roundTrip(account: string, user?: ReturnType<typeof makeCredentials>) {
  const b = build(account, user);
  const url = await b.svc.start('/users');
  const q = Object.fromEntries(new URL('http://x' + url).searchParams.entries());
  return { ...b, url, result: await b.svc.complete(q), query: q };
}

describe('System signs a user in with single sign-on (US-LGN01-002)', () => {
  /** @tc TC-LGN01-002-J01 @story US-LGN01-002 @ac AC-US-LGN01-002-01 @subtask ST-LGN01-002-BE-04 */
  it('TC-LGN01-002-J01 an available provider and an active user: the callback starts a session', async () => {
    const { result } = await roundTrip('ok-10002');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.nextStep).toBe('CHOOSE_WORK');
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(result.returnTo).toBe('/users');
    }
  });

  /** @tc TC-LGN01-002-J02 @story US-LGN01-002 @ac AC-US-LGN01-002-02 @subtask ST-LGN01-002-BE-04 */
  it('TC-LGN01-002-J02 every attempt writes an audit record with the result', async () => {
    const ok = await roundTrip('ok-10002');
    const cancel = await roundTrip('cancel');
    expect(JSON.stringify(ok.audit.rows)).toContain('SUCCESS');
    expect(JSON.stringify(cancel.audit.rows)).toContain('CANCELLED');
  });

  /** @tc TC-LGN01-002-J03 @story US-LGN01-002 @ac AC-US-LGN01-002-03 @subtask ST-LGN01-002-BE-04 */
  it('TC-LGN01-002-J03 SAML and OIDC (and the stub outside production) are the only choices', () => {
    const cfg = (m?: string, env = 'dev') => new ConfigService({ IDP_MODE: m, APP_ENV: env });
    expect(chooseProvider(cfg('saml'), 'dev').constructor.name).toBe('SamlIdentityProvider');
    expect(chooseProvider(cfg('oidc'), 'dev').constructor.name).toBe('OidcIdentityProvider');
    expect(chooseProvider(cfg('stub'), 'dev').constructor.name).toBe('TestIdentityProvider');
    expect(() => chooseProvider(cfg('ldap'), 'dev')).toThrow(/SAML|OIDC/);
  });

  /** @tc TC-LGN01-002-J04 @story US-LGN01-002 @ac AC-US-LGN01-002-04 @subtask ST-LGN01-002-BE-04 */
  it('TC-LGN01-002-J04 sign-in follows the employee code the provider confirms: another code finds no account', async () => {
    const r = await roundTrip('ok-77777');
    expect(r.result.ok).toBe(false);
    if (!r.result.ok) expect(r.result.kind).toBe('noaccount');
  });

  /** @tc TC-LGN01-002-J05 @story US-LGN01-002 @ac AC-US-LGN01-002-05 @subtask ST-LGN01-002-BE-04 */
  it('TC-LGN01-002-J05 a provider that does not answer gives the failed state with a reference', async () => {
    const r = await roundTrip('fail');
    expect(r.result.ok).toBe(false);
    if (!r.result.ok) {
      expect(r.result.kind).toBe('failed');
      expect(r.result.reference).toMatch(/^FAI-\d{4}-[A-Z0-9]{4}$/);
    }
  });

  /** @tc TC-LGN01-002-J06 @story US-LGN01-002 @ac AC-US-LGN01-002-06 @subtask ST-LGN01-002-BE-04 */
  it('TC-LGN01-002-J06 a person with no active AMS user gets the no-account state', async () => {
    const a = await roundTrip('noaccount');
    const b = await roundTrip('ok-10002', makeCredentials({ authType: 'SSO', passwordHash: null, status: 'INACTIVE' }));
    for (const r of [a, b]) {
      expect(r.result.ok).toBe(false);
      if (!r.result.ok) expect(r.result.kind).toBe('noaccount');
    }
  });

  /** @tc TC-LGN01-002-J07 @story US-LGN01-002 @ac AC-US-LGN01-002-07 @subtask ST-LGN01-002-BE-04 */
  it('TC-LGN01-002-J07 a user who stops at the provider gets the cancelled state', async () => {
    const r = await roundTrip('cancel');
    expect(r.result.ok).toBe(false);
    if (!r.result.ok) expect(r.result.kind).toBe('cancelled');
  });

  /** @tc TC-LGN01-002-J08 @story US-LGN01-002 @ac AC-US-LGN01-002-08 @subtask ST-LGN01-002-BE-04 */
  it('TC-LGN01-002-J08 the stub start address is the local callback with the state and the configured account; the stub is refused in production', async () => {
    const { url } = await roundTrip('ok-10002');
    expect(url).toMatch(/^\/api\/v1\/auth\/sso\/callback\?state=[A-Za-z0-9_-]+&account=ok-10002$/);
    expect(() => chooseProvider(new ConfigService({ IDP_MODE: 'stub' }), 'prod')).toThrow(/production/);
  });

  it('the state works once; a used or unknown state is a failed attempt', async () => {
    const b = build('ok-10002');
    const url = await b.svc.start(undefined);
    const q = Object.fromEntries(new URL('http://x' + url).searchParams.entries());
    expect((await b.svc.complete(q)).ok).toBe(true);
    const again = await b.svc.complete(q);
    expect(again.ok).toBe(false);
    const unknown = await b.svc.complete({ state: 'zzz', account: 'ok-10002' });
    expect(unknown.ok).toBe(false);
  });

  it('a return path that is not local is ignored', async () => {
    for (const bad of ['//evil.example', 'https://evil.example', 'javascript:alert(1)']) {
      const b = build('ok-10002');
      const url = await b.svc.start(bad);
      const q = Object.fromEntries(new URL('http://x' + url).searchParams.entries());
      const r = await b.svc.complete(q);
      expect(r.ok && r.returnTo).toBeFalsy();
    }
  });
});
