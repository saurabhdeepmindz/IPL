/**
 * @file    one-time-password.service.spec.ts
 * @module  UsersModule
 *
 * @description
 * Unit tests of the one-time password service (Jest). Written before the code (TDD); fakes replace the repository, the mailer and the hasher. In plain words: shows that a one-time password is random, stored only as a hash, mailed, and never logged or returned.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-05
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/one-time-password.service.spec.ts
 * @lld-synced     v0.19
 * @status         built
 */

import { Logger } from '@nestjs/common';
import { OneTimePasswordService } from './one-time-password.service';
import { FakeHasher, FakeMailer, FakeOtpRepo, FakeWrites } from './otp.fakes';

const user = { id: 'u-1', email: 'new.user@example.invalid', fullName: 'New User' };
/** 12 characters from the safe alphabet: no 0, O, 1, l, I. */
const SAFE = /^[A-HJ-NP-Za-km-z2-9]{12}$/;

describe('OneTimePasswordService.issue', () => {
  let passwords: FakeOtpRepo;
  let writes: FakeWrites;
  let mailer: FakeMailer;
  let service: OneTimePasswordService;

  beforeEach(() => {
    passwords = new FakeOtpRepo();
    writes = new FakeWrites();
    mailer = new FakeMailer();
    service = new OneTimePasswordService(new FakeHasher() as never, passwords as never, writes as never, mailer as never);
  });

  /**
   * @tc        TC-ADM01-007-J02
   * @story     US-ADM01-007
   * @ac        AC-US007-02
   * @subtask   ST-ADM01-007-BE-05
   * In plain words: the password is 12 random safe characters, only its hash is stored, the user must change it at the first sign-in, and the mail answer is returned.
   */
  it('issues a one-time password and reports SENT or FAILED', async () => {
    await expect(service.issue(user)).resolves.toBe('SENT');
    const sent = mailer.sent[0];
    expect(sent.to).toEqual({ email: user.email, fullName: user.fullName });
    expect(sent.password).toMatch(SAFE);
    expect(passwords.replaced).toEqual([{ userId: 'u-1', hash: `H:${sent.password}` }]);
    expect(passwords.replaced[0].hash).not.toBe(sent.password);
    expect(writes.mustChange).toEqual([{ userId: 'u-1', value: true }]);

    mailer.answer = 'FAILED';
    await expect(service.issue(user)).resolves.toBe('FAILED');
    expect(passwords.replaced).toHaveLength(2);
    expect(writes.mustChange).toHaveLength(2);
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-02
   * @subtask ST-ADM01-007-BE-05
   * In plain words: supporting test. If the mailer throws, the answer is FAILED and the password is still saved, so the Administrator can send it again.
   */
  it('answers FAILED and keeps the password when the mailer throws', async () => {
    mailer.answer = 'THROW';
    await expect(service.issue(user)).resolves.toBe('FAILED');
    expect(passwords.replaced).toHaveLength(1);
    expect(writes.mustChange).toEqual([{ userId: 'u-1', value: true }]);
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-02
   * @subtask ST-ADM01-007-BE-05
   * In plain words: supporting test. Two passwords differ, each replaces the earlier one, and the password is never logged or returned.
   */
  it('makes a new password each time and never logs or returns it', async () => {
    const lines: string[] = [];
    const spies = (['log', 'warn', 'error', 'debug', 'verbose'] as const).map((m) => jest.spyOn(Logger.prototype, m).mockImplementation((...a: unknown[]) => void lines.push(a.join(' '))));
    const first = await service.issue(user);
    const second = await service.issue(user);
    spies.forEach((s) => s.mockRestore());
    expect([first, second]).toEqual(['SENT', 'SENT']);
    expect(mailer.sent[0].password).not.toBe(mailer.sent[1].password);
    expect(passwords.replaced.map((r) => r.userId)).toEqual(['u-1', 'u-1']);
    for (const m of mailer.sent) expect(lines.join('\n')).not.toContain(m.password);
  });
});
