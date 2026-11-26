/**
 * @file    sso-state.store.ts
 * @module  AuthCoreModule
 *
 * @description
 * Round-trip state. In plain words: remembers the state value of a single sign-on round trip in Redis and lets it be used once.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-002
 * @subtask        ST-LGN01-002-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/sso-state.store.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis';
import { randomBytes } from 'node:crypto';
import { InvalidStateException } from './errors/auth-errors';

/**
 * SsoStateStore.
 *
 * In plain words: keeps the state of the round trip
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-002
   *   workflows: UF-01
   *   ac:        AC-US-LGN01-002-01
   *   lld:       LLD-EPIC-LGN-01 v0.4 section 6.2
 */
@Injectable()
export class SsoStateStore {
  constructor(
    private readonly redis: RedisService,
  ) {}

  /**
   * create.
   *
   * In plain words: makes and stores a state value
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-02
   * @workflow  UF-01
   * @ac        AC-US-LGN01-002-01
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.2
   * @status    built
   *
   * @returns Promise<string>
   */
  async create(returnTo: string | undefined): Promise<string> {
    const state = randomBytes(16).toString('base64url');
    await this.redis.setJson('ssostate:' + state, { returnTo }, 600);
    return state;
  }

  /**
   * consume.
   *
   * In plain words: checks and uses up a state value
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-02
   * @workflow  UF-01
   * @ac        AC-US-LGN01-002-01
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.2
   * @status    built
   *
   * @returns Promise<{ returnTo?: string }>
   * @throws InvalidStateException
   */
  async consume(state: string): Promise<{ returnTo?: string }> {
    const found = await this.redis.takeJson<{ returnTo?: string }>('ssostate:' + state);
    if (!found) throw new InvalidStateException();
    return found;
  }
}
