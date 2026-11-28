/**
 * @file    mailman.service.spec.ts
 * @module  Tests
 *
 * @description
 * Jest cases of US-LGN02-005 (System sends e-mail through the configured transport). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-04
 * @lld            LLD-EPIC-LGN-02 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/mailman/src/mailman.service.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Logger } from '@nestjs/common';
import { RealTemporaryPasswordMailer } from '@libs/users';
import { LogMailTransport } from './log-mail-transport';
import { Mailman } from './mailman.service';
import { chooseTransport } from './module';
import { MailTransport } from './mail-transport';
import { SmtpMailTransport } from './smtp-mail-transport';
import { MailJob, MailTemplates, PreparedMail } from './mail.types';
import { MailLogRepository } from './repositories/mail-log/contract';

class FakeQueue {
  jobs: { queue: string; name: string; data: MailJob; opts: { attempts: number } }[] = [];
  fail = false;
  async add(queue: string, name: string, data: MailJob, opts: { attempts: number }): Promise<void> {
    if (this.fail) throw new Error('Redis is down');
    this.jobs.push({ queue, name, data, opts });
  }
}
class FakeTransport extends MailTransport {
  sent: PreparedMail[] = [];
  down = false;
  async send(message: PreparedMail): Promise<void> {
    if (this.down) throw new Error('connect ECONNREFUSED');
    this.sent.push(message);
  }
}
class FakeLog extends MailLogRepository {
  rows: { messageName: string; recipient: string; result: string; attempts: number }[] = [];
  async add(entry: { messageName: string; recipient: string; result: string; attempts: number }): Promise<void> {
    this.rows.push(entry);
  }
}
const templates: MailTemplates = {
  'reset-link': (d) => ({ subject: 'Reset your AMS password', text: 'Open ' + d.link, html: '<a href="' + d.link + '">link</a>' }),
  'one-time-password': (d) => ({ subject: 'Your AMS one-time password', text: 'Password ' + d.oneTimePassword, html: '<b>' + d.oneTimePassword + '</b>' }),
};
function build() {
  const queue = new FakeQueue();
  const transport = new FakeTransport();
  const log = new FakeLog();
  const mailman = new Mailman(queue as never, transport, log);
  mailman.useTemplates(templates);
  return { queue, transport, log, mailman };
}

describe('System sends e-mail through the configured transport (US-LGN02-005)', () => {
  /** @tc TC-LGN02-005-J01 @story US-LGN02-005 @ac AC-US-LGN02-005-01 @subtask ST-LGN02-005-BE-04 */
  it('TC-LGN02-005-J01 queues the message and the worker sends it through the transport and records SENT', async () => {
    const { queue, transport, log, mailman } = build();
    await mailman.send('a.kumar@ipl.example', 'reset-link', { fullName: 'A. Kumar', link: 'https://x/set-password?token=t' });
    expect(queue.jobs).toHaveLength(1);
    expect(queue.jobs[0]).toMatchObject({ queue: 'mail', name: 'reset-link', opts: { attempts: 3 } });
    await mailman.sendNow(queue.jobs[0].data, 1);
    expect(transport.sent[0]).toMatchObject({ to: 'a.kumar@ipl.example', subject: 'Reset your AMS password' });
    expect(log.rows).toEqual([{ messageName: 'reset-link', recipient: 'a.kumar@ipl.example', result: 'SENT', attempts: 1 }]);
  });

  /** @tc TC-LGN02-005-J02 @story US-LGN02-005 @ac AC-US-LGN02-005-02 @subtask ST-LGN02-005-BE-04 */
  it('TC-LGN02-005-J02 a failing transport records FAILED and rethrows so the queue retries; the caller sees no error', async () => {
    const { queue, transport, log, mailman } = build();
    transport.down = true;
    await expect(mailman.send('a@ipl.example', 'reset-link', { fullName: 'A', link: 'l' })).resolves.toBeUndefined();
    await expect(mailman.sendNow(queue.jobs[0].data, 2)).rejects.toThrow('ECONNREFUSED');
    expect(log.rows).toEqual([{ messageName: 'reset-link', recipient: 'a@ipl.example', result: 'FAILED', attempts: 2 }]);
  });

  it('TC-LGN02-005-J02b refuses a wrong address or an unknown message name at once', async () => {
    const { mailman } = build();
    await expect(mailman.send('not-an-address', 'reset-link', {})).rejects.toThrow(/recipient/);
    await expect(mailman.send('a@ipl.example', 'unknown-message', {})).rejects.toThrow(/message/);
  });

  /** @tc TC-LGN02-005-J03 @story US-LGN02-005 @ac AC-US-LGN02-005-03 @subtask ST-LGN02-005-BE-04 */
  it('TC-LGN02-005-J03 the real one-time-password mailer answers SENT when queued and FAILED when queueing fails, and never throws', async () => {
    const { queue, mailman } = build();
    const real = new RealTemporaryPasswordMailer(mailman);
    await expect(real.send({ email: 'a@ipl.example', fullName: 'A. Kumar' }, 'Temp#1234')).resolves.toBe('SENT');
    expect(queue.jobs[0].name).toBe('one-time-password');
    queue.fail = true;
    await expect(real.send({ email: 'a@ipl.example', fullName: 'A. Kumar' }, 'Temp#1234')).resolves.toBe('FAILED');
  });

  /** @tc TC-LGN02-005-J04 @story US-LGN02-005 @ac AC-US-LGN02-005-04 @subtask ST-LGN02-005-BE-04 */
  it('TC-LGN02-005-J04 the log transport writes the link but never a password, and log is refused in production', async () => {
    const lines: string[] = [];
    jest.spyOn(Logger.prototype, 'log').mockImplementation((m: unknown) => void lines.push(String(m)));
    const transport = new LogMailTransport(null);
    await transport.send({ to: 'a@ipl.example', subject: 'Reset', text: 'Open https://x/set-password?token=t now', html: '' });
    await transport.send({ to: 'a@ipl.example', subject: 'Your AMS one-time password', text: 'Password Temp#1234', html: '' });
    expect(lines.join('\n')).toContain('https://x/set-password?token=t');
    expect(lines.join('\n')).not.toContain('Temp#1234');
    expect(() => chooseTransport('log', 'prod', null as never)).toThrow(/prod/);
    expect(chooseTransport('log', 'dev', null as never)).toBeInstanceOf(LogMailTransport);
    jest.restoreAllMocks();
  });

  /** @tc TC-LGN02-005-J04b @story US-LGN02-005 @ac AC-US-LGN02-005-04 @subtask ST-LGN02-005-BE-04 */
  it('TC-LGN02-005-J04b the log transport also hands the message, with its link, to the local mail trap', async () => {
    const trap = new SmtpMailTransport({ host: 'localhost', port: 1025, user: '', password: '', from: 'ams@ipl.example' });
    const to = `j04b${Date.now()}@ipl.example`;
    await new LogMailTransport(trap).send({ to, subject: 'Reset your AMS password', text: 'Open https://x/set-password?token=abc now', html: '<p>x</p>' });
    const res = await fetch(`http://localhost:8025/api/v2/search?kind=to&query=${to}`);
    const found = (await res.json()) as { items: { Raw: { Data: string } }[] };
    expect(found.items).toHaveLength(1);
    expect(found.items[0].Raw.Data).toContain('set-password?token=abc');
  });
});
