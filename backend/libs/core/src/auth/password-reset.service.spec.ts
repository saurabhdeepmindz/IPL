/**
 * @file    password-reset.service.spec.ts
 * @module  Tests
 *
 * @description
 * Jest cases of US-LGN02-002 (System checks a reset link and sets a new password). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-002
 * @subtask        ST-LGN02-002-BE-04
 * @lld            LLD-EPIC-LGN-02 v0.3 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/password-reset.service.spec.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { SettingsService } from '@libs/settings';
import { FakeHasher } from './auth.fakes';
import { LinkExpiredException, PasswordPolicyException, PasswordReusedException } from './errors/password-errors';
import { FakeAudit, FakeHistoryRepo, FakePasswordWrites, FakeTokens } from './password.fakes';
import { PasswordPolicyService } from './password-policy.service';
import { PasswordResetService } from './password-reset.service';

const sha = (t: string) => createHash('sha256').update(t).digest('hex');
function build() {
  const tokens = new FakeTokens();
  const history = new FakeHistoryRepo();
  const writes = new FakePasswordWrites();
  const ended: string[] = [];
  const settings = new SettingsService(new ConfigService({}));
  const policy = new PasswordPolicyService(history, new FakeHasher() as never, settings);
  const sessions = { endAll: async (u: string) => void ended.push(u) };
  const svc = new PasswordResetService(tokens, policy, new FakeHasher() as never, writes as never, sessions as never, new FakeAudit() as never, settings);
  return { svc, tokens, history, writes, ended };
}

describe('System checks a reset link and sets a new password (US-LGN02-002)', () => {
  /** @tc TC-LGN02-002-J01 @story US-LGN02-002 @ac AC-US-LGN02-002-01 @subtask ST-LGN02-002-BE-04 */
  it('TC-LGN02-002-J01 a used, old, replaced or unknown link all give LINK_EXPIRED', async () => {
    const { svc, tokens } = build();
    await tokens.issue('u1', sha('used'));
    await tokens.markUsed(sha('used'));
    await tokens.issue('u1', sha('old'));
    tokens.rows[1].issuedAt = new Date(Date.now() - 31 * 60000);
    await tokens.issue('u1', sha('first'));
    await tokens.issue('u1', sha('second'));
    for (const t of ['used', 'old', 'first', 'nothing']) {
      await expect(svc.checkLink(t)).rejects.toBeInstanceOf(LinkExpiredException);
      await expect(svc.setPassword({ token: t, newPassword: 'Abcdef1!' })).rejects.toBeInstanceOf(LinkExpiredException);
    }
    await expect(svc.checkLink('second')).resolves.toEqual({ valid: true, maskedEmail: 'a.\u2022\u2022\u2022@ipl.example' });
  });

  /** @tc TC-LGN02-002-J02 @story US-LGN02-002 @ac AC-US-LGN02-002-02 @subtask ST-LGN02-002-BE-04 */
  it('TC-LGN02-002-J02 a good link and password save the hash, keep the history, end other sessions and use the link up', async () => {
    const { svc, tokens, history, writes, ended } = build();
    await tokens.issue('u1', sha('good'));
    await expect(svc.setPassword({ token: 'good', newPassword: 'abc' })).rejects.toBeInstanceOf(PasswordPolicyException);
    expect(tokens.rows[0].usedAt).toBeNull();
    await expect(svc.setPassword({ token: 'good', newPassword: 'Newpass1!' })).resolves.toEqual({ done: true });
    expect(writes.hash).toBe('H:Newpass1!');
    expect(history.rows).toEqual(['H:Newpass1!']);
    expect(ended).toEqual(['u1']);
    await expect(svc.setPassword({ token: 'good', newPassword: 'Another1!' })).rejects.toBeInstanceOf(LinkExpiredException);
    await tokens.issue('u1', sha('again'));
    await expect(svc.setPassword({ token: 'again', newPassword: 'Newpass1!' })).rejects.toBeInstanceOf(PasswordReusedException);
  });
});
