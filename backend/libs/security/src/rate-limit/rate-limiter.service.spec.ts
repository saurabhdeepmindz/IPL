/**
 * @file    rate-limiter.service.spec.ts
 * @module  SecurityModule
 *
 * @description
 * Jest cases of the rate limiter. In plain words: the call at the limit passes, the next is refused.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-000
 * @subtask        ST-LGN01-000-BE-03
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/security/src/rate-limit/rate-limiter.service.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { FakeRedis } from '@libs/core/auth/auth.fakes';
import { RateLimiterService } from './rate-limiter.service';

describe('Rate limiter (set-up of EPIC-LGN-01)', () => {
  it('passes calls up to the limit and refuses the next with the seconds left', async () => {
    const svc = new RateLimiterService(new FakeRedis() as never);
    for (let i = 0; i < 3; i++) expect((await svc.hit('k', 3, 60)).allowed).toBe(true);
    const r = await svc.hit('k', 3, 60);
    expect(r.allowed).toBe(false);
    expect(r.retryAfterSeconds).toBe(60);
  });

  it('counts each key on its own', async () => {
    const svc = new RateLimiterService(new FakeRedis() as never);
    await svc.hit('a', 1, 60);
    expect((await svc.hit('b', 1, 60)).allowed).toBe(true);
  });
});
