/**
 * @file    password-reset-request.service.spec.ts
 * @module  Tests
 *
 * @description
 * Jest cases of US-LGN02-001 (System accepts a reset request and sends the reset e-mail). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-001
 * @subtask        ST-LGN02-001-BE-04
 * @lld            LLD-EPIC-LGN-02 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/password-reset-request.service.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { ConfigService } from '@nestjs/config';
import { SettingsService } from '@libs/settings';
import { RateLimitedException } from './errors';
import { FakeAudit, FakeMailman, FakeRates, FakeTokens } from './password.fakes';
import { PasswordResetRequestService } from './password-reset-request.service';

const user = { id: 'u1', employeeCode: '10002', fullName: 'A. Kumar', email: 'a.kumar@ipl.example', authType: 'LOCAL', status: 'ACTIVE' };
function build(over: Partial<typeof user> = {}) {
  const tokens = new FakeTokens();
  const mail = new FakeMailman();
  const rates = new FakeRates();
  const audit = new FakeAudit();
  const users = { findByCode: async (c: string) => (c === '10002' ? { ...user, ...over } : null) };
  const config = new ConfigService({ WEB_BASE_URL: 'https://ams.example' });
  const svc = new PasswordResetRequestService(rates as never, tokens, users as never, mail as never, audit as never, new SettingsService(config), config);
  return { svc, tokens, mail, rates, audit };
}
const ask = (svc: PasswordResetRequestService, code = '10002', email = 'a.kumar@ipl.example', address = '1.1.1.1') => svc.request({ employeeCode: code, email }, address);

describe('System accepts a reset request and sends the reset e-mail (US-LGN02-001)', () => {
  /** @tc TC-LGN02-001-J01 @story US-LGN02-001 @ac AC-US-LGN02-001-01 @subtask ST-LGN02-001-BE-04 */
  it('TC-LGN02-001-J01 gives the same answer whether or not the pair matched', async () => {
    const hit = build();
    const miss = build();
    const a = await ask(hit.svc);
    const b = await ask(miss.svc, '99999', 'nobody@ipl.example');
    const c = await ask(build().svc, '10002', 'wrong@ipl.example');
    expect(b).toEqual(a);
    expect(c).toEqual(a);
    expect(miss.mail.sent).toHaveLength(0);
  });

  /** @tc TC-LGN02-001-J02 @story US-LGN02-001 @ac AC-US-LGN02-001-02 @subtask ST-LGN02-001-BE-04 */
  it('TC-LGN02-001-J02 queues one reset e-mail with a link, stores only the hash and replaces an older link', async () => {
    const { svc, tokens, mail } = build();
    await ask(svc);
    expect(mail.sent).toHaveLength(1);
    const token = new URL(mail.sent[0].data.link).searchParams.get('token') as string;
    expect(mail.sent[0]).toMatchObject({ to: 'a.kumar@ipl.example', name: 'reset-link' });
    expect(mail.sent[0].data.link).toContain('https://ams.example/set-password?token=');
    expect(tokens.rows).toHaveLength(1);
    expect(tokens.rows[0].tokenHash).not.toBe(token);
    expect(tokens.rows[0].tokenHash).toHaveLength(64);
  });

  /** @tc TC-LGN02-001-J03 @story US-LGN02-001 @ac AC-US-LGN02-001-03 @subtask ST-LGN02-001-BE-04 */
  it('TC-LGN02-001-J03 a second request within 60 seconds sends nothing and carries the time left', async () => {
    const { svc, mail } = build();
    await ask(svc);
    const second = await ask(svc);
    expect(mail.sent).toHaveLength(1);
    expect(second.retryAfterSeconds).toBeGreaterThan(0);
    expect(second.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  /** @tc TC-LGN02-001-J04 @story US-LGN02-001 @ac AC-US-LGN02-001-04 @subtask ST-LGN02-001-BE-04 */
  it('TC-LGN02-001-J04 a single sign-on user gets the same answer and no e-mail', async () => {
    const { svc, mail, tokens } = build({ authType: 'SSO' });
    const a = await ask(svc);
    expect(a).toEqual(await ask(build().svc));
    expect(mail.sent).toHaveLength(0);
    expect(tokens.rows).toHaveLength(0);
  });

  /** @tc TC-LGN02-001-J05b @story US-LGN02-001 @ac AC-US-LGN02-001-05 @subtask ST-LGN02-001-BE-04 */
  it('TC-LGN02-001-J05b more than 10 requests from one address in the window get 429', async () => {
    const { svc } = build();
    for (let i = 0; i < 10; i++) await ask(svc, String(10000 + i), 'x@ipl.example', '9.9.9.9');
    await expect(ask(svc, '10099', 'x@ipl.example', '9.9.9.9')).rejects.toBeInstanceOf(RateLimitedException);
  });

  /** @tc TC-LGN02-001-J05 @story US-LGN02-001 @ac AC-US-LGN02-001-05 @subtask ST-LGN02-001-BE-04 */
  it('TC-LGN02-001-J05 more than 3 requests for one code in the window get 429', async () => {
    const { svc } = build();
    for (let i = 0; i < 3; i++) await ask(svc);
    await expect(ask(svc)).rejects.toBeInstanceOf(RateLimitedException);
  });
});
