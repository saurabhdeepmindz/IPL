/**
 * @file    temporary-password-change.service.spec.ts
 * @module  Tests
 *
 * @description
 * Jest cases of US-LGN02-004 (System changes a temporary password). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-004
 * @subtask        ST-LGN02-004-BE-04
 * @lld            LLD-EPIC-LGN-02 v0.3 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/temporary-password-change.service.spec.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { ConfigService } from '@nestjs/config';
import { SettingsService } from '@libs/settings';
import { FakeHasher, FakeUserStore, makeCredentials } from './auth.fakes';
import { AccountLockPolicy } from './account-lock.policy';
import { InvalidCredentialsException } from './errors/auth-errors';
import { NotRequiredException, PasswordPolicyException, SameAsTemporaryException } from './errors/password-errors';
import { FakeHistoryRepo, FakePasswordWrites } from './password.fakes';
import { PasswordPolicyService } from './password-policy.service';
import { TemporaryPasswordChangeService } from './temporary-password-change.service';

function build(user = makeCredentials({ passwordHash: 'H:Temp#1234', mustChangePassword: true })) {
  const store = new FakeUserStore(user);
  const history = new FakeHistoryRepo();
  const writes = new FakePasswordWrites();
  const sessions = { create: async () => ({ accessToken: 'new', refreshToken: 'r', refreshSeconds: 1, expiresIn: 900 }), end: async () => undefined };
  const settings = new SettingsService(new ConfigService({}));
  const policy = new PasswordPolicyService(history, new FakeHasher() as never, settings);
  const sign = { record: async () => 'BAD-0001-AAAA' };
  const svc = new TemporaryPasswordChangeService(store as never, writes as never, writes as never, new FakeHasher() as never, policy, new AccountLockPolicy(), sessions as never, sign as never);
  return { svc, writes, history, store };
}
const me = { userId: 'u1', employeeCode: '10002', sid: 's1' };

describe('System changes a temporary password (US-LGN02-004)', () => {
  /** @tc TC-LGN02-004-J01 @story US-LGN02-004 @ac AC-US-LGN02-004-01 @subtask ST-LGN02-004-BE-04 */
  it('TC-LGN02-004-J01 a user who does not have to change gets NOT_REQUIRED', async () => {
    const { svc } = build(makeCredentials({ passwordHash: 'H:Temp#1234', mustChangePassword: false }));
    await expect(svc.change({ temporaryPassword: 'Temp#1234', newPassword: 'Newpass1!' }, me)).rejects.toBeInstanceOf(NotRequiredException);
  });

  /** @tc TC-LGN02-004-J02 @story US-LGN02-004 @ac AC-US-LGN02-004-02 @subtask ST-LGN02-004-BE-04 */
  it('TC-LGN02-004-J02 saves the new password, clears the flag and issues a new session', async () => {
    const { svc, writes, history } = build();
    await expect(svc.change({ temporaryPassword: 'Temp#1234', newPassword: 'Temp#1234' }, me)).rejects.toBeInstanceOf(SameAsTemporaryException);
    await expect(svc.change({ temporaryPassword: 'Temp#1234', newPassword: 'abc' }, me)).rejects.toBeInstanceOf(PasswordPolicyException);
    const out = await svc.change({ temporaryPassword: 'Temp#1234', newPassword: 'Newpass1!' }, me);
    expect(out.nextStep).toBe('CHOOSE_WORK');
    expect(out.session.accessToken).toBe('new');
    expect(writes.calls).toEqual(['hash', 'otp-used']);
    expect(history.rows).toEqual(['H:Newpass1!']);
  });

  /** @tc TC-LGN02-004-J03 @story US-LGN02-004 @ac AC-US-LGN02-004-03 @subtask ST-LGN02-004-BE-04 */
  it('TC-LGN02-004-J03 a wrong temporary password is 401 and counts as a failed sign-in', async () => {
    const { svc, writes } = build();
    await expect(svc.change({ temporaryPassword: 'wrong', newPassword: 'Newpass1!' }, me)).rejects.toBeInstanceOf(InvalidCredentialsException);
    expect(writes.calls).toContain('fail:1');
  });
});
