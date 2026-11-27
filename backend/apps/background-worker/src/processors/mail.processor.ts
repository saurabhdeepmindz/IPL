/**
 * @file    mail.processor.ts
 * @module  BackgroundWorker
 *
 * @description
 * The mail job processor. In plain words: takes mail jobs from the queue, sends them with retries and raises an alarm after the last try.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/apps/background-worker/src/processors/mail.processor.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import cacheConfig from '@config/cache';
import mailConfig from '@config/mail';
import { MAIL_QUEUE, MAIL_TEMPLATES, MailJob, MailTemplates, Mailman } from '@libs/mailman';

/**
 * MailProcessor.
 *
 * In plain words: takes mail jobs from the queue and sends them. A failure is thrown again so the queue tries once more after 1, then 5, then 15 minutes; after the last try it writes an alarm line.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
@Injectable()
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);
  private worker?: Worker<MailJob>;

  constructor(
    private readonly mailman: Mailman,
    private readonly config: ConfigService,
    @Inject(MAIL_TEMPLATES) templates: MailTemplates,
  ) {
    mailman.useTemplates(templates);
  }

  /**
   * Handles one job.
   *
   * In plain words: sends it; on the last failed try writes the alarm line the monitoring watches (MAIL_FAILED).
   *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-005
 * @subtask   ST-LGN02-005-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-005-01
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.0
 * @status    built
   *
   * @dependencies Mailman.sendNow
   *
   * @throws The send error, so the queue retries
   */
  async process(job: Job<MailJob>): Promise<void> {
    const attempt = job.attemptsMade + 1;
    try {
      await this.mailman.sendNow(job.data, attempt);
    } catch (error) {
      if (attempt >= (job.opts.attempts ?? 1)) this.logger.error(`MAIL_FAILED ${job.data.messageName} to ${job.data.to} after ${attempt} tries: ${(error as Error).message}`);
      throw error;
    }
  }

  /** Starts the worker on the `mail` queue (called when the application starts). */
  start(): void {
    const delays = this.config.get<number[]>('mail.retryDelaysMs') ?? mailConfig().retryDelaysMs;
    const cache = this.config.get<ReturnType<typeof cacheConfig>>('cache') ?? cacheConfig();
    this.worker = new Worker<MailJob>(MAIL_QUEUE, (job) => this.process(job), {
      connection: { host: cache.host, port: cache.port },
      prefix: cache.prefix,
      settings: { backoffStrategy: (attemptsMade: number) => delays[Math.min(attemptsMade - 1, delays.length - 1)] },
    });
    this.worker.on('error', (e) => this.logger.error('Queue error: ' + e.message));
  }

  /** Stops the worker at shutdown. */
  async stop(): Promise<void> {
    await this.worker?.close();
  }
}
