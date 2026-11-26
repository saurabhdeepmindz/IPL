/**
 * @file    rate-limiter.service.ts
 * @module  SecurityModule
 *
 * @description
 * Limits calls. In plain words: counts calls per key in Redis and says when the limit is passed (sign-in and reset calls, OWASP A07).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-000, US-LGN01-001
 * @subtask        ST-LGN01-000-BE-03
 * @lld            LLD-EPIC-LGN-01 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/security/src/rate-limit/rate-limiter.service.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { RedisService } from '@libs/core/redis';

/**
 * RateLimiterService.
 *
 * In plain words: a fixed-window call counter
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-000, US-LGN01-001
   *   workflows: UF-01
   *   lld:       LLD-EPIC-LGN-01 v0.3 section 6.0
 */
@Injectable()
export class RateLimiterService {
  constructor(
    private readonly redis: RedisService,
  ) {}

  /**
   * hit.
   *
   * In plain words: counts one call and tells whether it is allowed
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-000
   * @subtask   ST-LGN01-000-BE-03
   * @workflow  UF-01
   * @lld       LLD-EPIC-LGN-01 v0.3 §6.0
   * @status    built
   *
   * @dependencies RedisService.incr, RedisService.expire
   *
   * @returns Promise<{ allowed: boolean; retryAfterSeconds: number }>
   */
  async hit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
    const { count, ttlSeconds } = await this.redis.increment('rl:' + key, windowSeconds);
    return count <= limit ? { allowed: true, retryAfterSeconds: 0 } : { allowed: false, retryAfterSeconds: ttlSeconds };
  }
}
