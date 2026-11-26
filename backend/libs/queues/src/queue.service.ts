/**
 * @file    queue.service.ts
 * @module  QueuesModule
 *
 * @description
 * The queue service of the platform (BullMQ). In plain words: adds a job to a named queue in Redis for a worker application to take.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-02
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/queues/src/queue.service.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import cacheConfig from '@config/cache';

/** How a job is repeated after a failure: the number of tries; the waits come from the worker. */
export interface QueueJobOptions {
  attempts: number;
}

/**
 * QueueService.
 *
 * In plain words: adds a job to a named queue in Redis (BullMQ); a worker application takes it from there.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.1
 */
@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly queues = new Map<string, Queue>();

  constructor(private readonly config: ConfigService) {}

  /**
   * Adds one job.
   *
   * In plain words: the job waits in Redis until a worker takes it; a failed job is tried again with the waits the worker sets (custom back-off).
   *
   * @dependencies bullmq.Queue.add
   */
  async add(queueName: string, jobName: string, data: unknown, options: QueueJobOptions): Promise<void> {
    await this.queue(queueName).add(jobName, data, { attempts: options.attempts, backoff: { type: 'custom' }, removeOnComplete: true, removeOnFail: 1000 });
  }

  /** Closes the connections at shutdown. */
  async onModuleDestroy(): Promise<void> {
    await Promise.all([...this.queues.values()].map((q) => q.close()));
  }

  private queue(name: string): Queue {
    let q = this.queues.get(name);
    if (!q) {
      const cache = this.config.get<{ host: string; port: number }>('cache') ?? cacheConfig();
      q = new Queue(name, { connection: { host: cache.host, port: cache.port }, prefix: this.config.get<string>('cache.prefix') ?? cacheConfig().prefix });
      this.queues.set(name, q);
    }
    return q;
  }
}
