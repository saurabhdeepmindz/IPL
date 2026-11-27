/**
 * @file    temporary-password-mailer.real.spec.ts
 * @module  UsersModule
 *
 * @description
 * Jest cases of the real one-time password mailer. In plain words: the mailer says SENT when the e-mail is queued, says FAILED (and does not throw) when queueing fails, and never writes the password into the log.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-010
 * @subtask        ST-LGN02-010-IN-01
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.6
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/users/src/ports/temporary-password-mailer.real.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Logger } from '@nestjs/common';
import { Mailman } from '@libs/mailman';
import { RealTemporaryPasswordMailer } from './temporary-password-mailer.real';

const to = { email: 'user@example.invalid', fullName: 'Test User' };

describe('RealTemporaryPasswordMailer (US-LGN02-010)', () => {
  afterEach(() => jest.restoreAllMocks());

  /** @story US-LGN02-010 @ac AC-US-LGN02-010-01 @subtask ST-LGN02-010-IN-01 In plain words: supporting test. A queued e-mail answers SENT and carries the name and the password for the template. */
  it('answers SENT when the e-mail is queued', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const mailer = new RealTemporaryPasswordMailer({ send } as unknown as Mailman);
    await expect(mailer.send(to, 'Secret#1')).resolves.toBe('SENT');
    expect(send).toHaveBeenCalledWith('user@example.invalid', 'one-time-password', { fullName: 'Test User', oneTimePassword: 'Secret#1' });
  });

  /** @story US-LGN02-010 @ac AC-US-LGN02-010-01 @subtask ST-LGN02-010-IN-01 In plain words: supporting test. When the e-mail cannot be queued the answer is FAILED, nothing is thrown and the password is not in the log. */
  it('answers FAILED without throwing, and never logs the password', async () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const send = jest.fn().mockRejectedValue(new Error('queue is down'));
    const mailer = new RealTemporaryPasswordMailer({ send } as unknown as Mailman);
    await expect(mailer.send(to, 'Secret#1')).resolves.toBe('FAILED');
    expect(error).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(error.mock.calls)).not.toContain('Secret#1');
  });
});
