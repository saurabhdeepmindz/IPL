/**
 * @file    mailman.service.ts
 * @module  MailmanModule
 *
 * @description
 * The mail service. In plain words: puts a mail job on the queue so no screen waits for the mail server, and records the result.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/mailman/src/mailman.service.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { QueueService } from '@libs/queues';
import { MailTransport } from './mail-transport';
import { MESSAGE_NAMES, MailJob, MailTemplates } from './mail.types';
import { MailLogRepository } from './repositories/mail-log/contract';

/** The queue of the mail jobs. */
export const MAIL_QUEUE = 'mail';
/** Three tries in all (decision S-2 of US-LGN02-005). */
const ATTEMPTS = 3;
const ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Mailman.
 *
 * In plain words: the one way to send e-mail. `send` puts the message in the queue so no screen waits; the worker calls `sendNow`.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
@Injectable()
export class Mailman {
  private templates: MailTemplates = {};

  constructor(
    private readonly queue: QueueService,
    private readonly transport: MailTransport,
    private readonly log: MailLogRepository,
  ) {}

  /** The worker gives the templates (they live in the worker application). */
  useTemplates(templates: MailTemplates): void {
    this.templates = templates;
  }

  /**
   * Queues one message.
   *
   * In plain words: checks the address and the name, then adds the job (3 tries, growing waits). A transport failure is not seen here.
   *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-005
 * @subtask   ST-LGN02-005-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-005-01
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.0
 * @status    built
   *
   * @dependencies QueueService.add
   *
   * @throws Error when the address or the message name is wrong, or the queue is down
   */
  async send(to: string, messageName: string, data: Record<string, string>): Promise<void> {
    if (!ADDRESS.test(to)) throw new Error('The recipient address is not valid');
    if (!(MESSAGE_NAMES as readonly string[]).includes(messageName)) throw new Error('The message name is not known');
    const job: MailJob = { to, messageName, data };
    await this.queue.add(MAIL_QUEUE, messageName, job, { attempts: ATTEMPTS });
  }

  /**
   * Sends one queued message now (called by the worker).
   *
   * In plain words: composes the message from its template, hands it to the transport and records SENT or FAILED; a failure is thrown again so the queue tries once more.
   *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-005
 * @subtask   ST-LGN02-005-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-005-01
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.0
 * @status    built
   *
   * @dependencies MailTransport.send, MailLogRepository.add
   *
   * @throws The transport error, after the FAILED record
   */
  async sendNow(job: MailJob, attempt: number): Promise<void> {
    const template = this.templates[job.messageName];
    if (!template) throw new Error('No template for ' + job.messageName);
    try {
      await this.transport.send({ to: job.to, ...template(job.data) });
    } catch (error) {
      await this.log.add({ messageName: job.messageName, recipient: job.to, result: 'FAILED', attempts: attempt });
      throw error;
    }
    await this.log.add({ messageName: job.messageName, recipient: job.to, result: 'SENT', attempts: attempt });
  }
}
