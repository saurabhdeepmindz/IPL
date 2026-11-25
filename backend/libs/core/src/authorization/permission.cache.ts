/**
 * @file    permission.cache.ts
 * @module  AuthorizationModule
 *
 * @description
 * A short-lived store of who holds which roles and what each role allows. In plain words: it saves the guards from asking the database on every call, and it is emptied the moment the matrix or a user's roles change.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/permission.cache.ts
 * @lld-synced     v0.21
 * @status         built
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis';

/** How long an entry lives, in seconds (decision L-03). */
const CACHE_SECONDS = 60;

/** Key of the roles a user holds in a company. */
export const userRolesKey = (userId: string, companyCode: string): string => `perm:user:${userId}:${companyCode}`;

/** Key of the cells of one role. */
export const roleCellsKey = (roleId: string): string => `perm:role:${roleId}`;

/**
 * Redis cache for the authorization lookups.
 *
 * In plain words: remembers the last answer for 60 seconds; forgets everything when told.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017, US-ADM01-014, US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: API-PRM-03, API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.21 §6.8
 */
@Injectable()
export class PermissionCache {
  private readonly logger = new Logger(PermissionCache.name);

  constructor(private readonly redis: RedisService) {}

  /**
   * Reads one entry.
   *
   * In plain words: returns the remembered answer, or nothing when it has expired.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-05
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.21 §6.8
 * @status    built
   *
   * @dependencies RedisService.getJson
   *
   * @param key - One of the key builders above
   * @returns The stored value, or null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.redis.getJson<T>(key);
    } catch (err) {
      this.logger.warn(`Cache read failed: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  /**
   * Stores one entry for 60 seconds.
   *
   * In plain words: remembers an answer for a short time.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-05
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.21 §6.8
 * @status    built
   *
   * @dependencies RedisService.setJson
   *
   * @param key - One of the key builders above
   * @param value - What to remember
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await this.redis.setJson(key, value, CACHE_SECONDS);
    } catch (err) {
      this.logger.warn(`Cache write failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Forgets every entry. Called after a matrix save (API-PRM-03).
   *
   * In plain words: the matrix changed, so nothing remembered is trusted any more.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-05
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.21 §6.8
 * @status    built
   *
   * @dependencies RedisService.deleteByPrefix
   */
  async clearAll(): Promise<void> {
    await this.redis.deleteByPrefix('perm:');
  }

  /**
   * Forgets what is remembered about one user. Called when a role is given or taken (decision L-08).
   *
   * In plain words: this person's roles changed, so look them up afresh on the next call.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-05
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.21 §6.8
 * @status    built
   *
   * @dependencies RedisService.deleteByPrefix
   *
   * @param userId - The user whose roles changed
   */
  async clearUser(userId: string): Promise<void> {
    await this.redis.deleteByPrefix(`perm:user:${userId}:`);
  }
}
