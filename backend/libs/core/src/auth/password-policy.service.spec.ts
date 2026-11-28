/**
 * @file    password-policy.service.spec.ts
 * @module  Tests
 *
 * @description
 * Jest cases of US-LGN02-003 (System checks the password policy and keeps the last three passwords). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-003
 * @subtask        ST-LGN02-003-BE-04
 * @lld            LLD-EPIC-LGN-02 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/password-policy.service.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { ConfigService } from '@nestjs/config';
import { SettingsService } from '@libs/settings';
import { FakeHasher } from './auth.fakes';
import { PasswordPolicyService } from './password-policy.service';
import { PasswordPolicyException, PasswordReusedException } from './errors';
import { PasswordHistoryRepository } from './repositories/password-history/contract';

class FakeHistory extends PasswordHistoryRepository {
  rows: string[] = [];
  async lastHashes(_u: string, count: number): Promise<string[]> {
    return this.rows.slice(0, count);
  }
  async add(_u: string, hash: string): Promise<void> {
    this.rows.unshift(hash);
  }
  async trim(_u: string, keep: number): Promise<void> {
    this.rows = this.rows.slice(0, keep);
  }
}

function build() {
  const history = new FakeHistory();
  const policy = new PasswordPolicyService(history, new FakeHasher() as never, new SettingsService(new ConfigService({})));
  return { history, policy };
}

describe('System checks the password policy and keeps the last three passwords (US-LGN02-003)', () => {
  /** @tc TC-LGN02-003-J01 @story US-LGN02-003 @ac AC-US-LGN02-003-01 @subtask ST-LGN02-003-BE-04 */
  it('TC-LGN02-003-J01 lists every rule that is not met', async () => {
    const { policy } = build();
    expect(policy.unmetRules('abc')).toEqual(['MIN_LENGTH', 'UPPER', 'NUMBER', 'SYMBOL']);
    expect(policy.unmetRules('Abcdef1!')).toEqual([]);
    await expect(policy.check('u1', 'abc')).rejects.toMatchObject({ code: 'PASSWORD_POLICY', unmet: ['MIN_LENGTH', 'UPPER', 'NUMBER', 'SYMBOL'] });
    await expect(policy.check('u1', 'abc')).rejects.toBeInstanceOf(PasswordPolicyException);
  });

  /** @tc TC-LGN02-003-J02 @story US-LGN02-003 @ac AC-US-LGN02-003-02 @subtask ST-LGN02-003-BE-04 */
  it('TC-LGN02-003-J02 refuses one of the last three passwords and keeps only three', async () => {
    const { policy, history } = build();
    for (const p of ['Aaaaaa1!', 'Bbbbbb2@', 'Cccccc3#', 'Dddddd4$']) await policy.remember('u1', 'H:' + p);
    expect(history.rows).toHaveLength(3);
    await expect(policy.check('u1', 'Dddddd4$')).rejects.toBeInstanceOf(PasswordReusedException);
    await expect(policy.check('u1', 'Bbbbbb2@')).rejects.toMatchObject({ code: 'PASSWORD_REUSED' });
    await expect(policy.check('u1', 'Aaaaaa1!')).resolves.toBeUndefined();
  });
});
