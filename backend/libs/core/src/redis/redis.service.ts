/**
 * @file    redis.service.ts
 * @module  CoreModule
 *
 * @description
 * Small Redis helper: save, read and delete JSON values under the configured prefix.
 * In plain words: the rest of the code never touches Redis directly; it asks this service.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-05
 */

import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CacheUnavailableException } from './cache-unavailable.exception';

export const REDIS_OPTIONS = 'REDIS_OPTIONS';

export interface RedisOptions {
  host: string;
  port: number;
  prefix: string;
}

/**
 * Redis service.
 *
 * In plain words: every key is stored as `<REDIS_PREFIX>:<key>`; a fault becomes a typed exception.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(@Inject(REDIS_OPTIONS) private readonly options: RedisOptions) {
    this.client = new Redis({
      host: options.host,
      port: options.port,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: () => null,
    });
    this.client.on('error', () => undefined);
  }

  private k(key: string): string {
    return `${this.options.prefix}:${key}`;
  }

  private async guard<T>(work: () => Promise<T>): Promise<T> {
    try {
      if (this.client.status === 'wait' || this.client.status === 'end') await this.client.connect();
      return await work();
    } catch (err) {
      this.logger.error(`Redis fault: ${err instanceof Error ? err.message : String(err)}`);
      throw new CacheUnavailableException(err);
    }
  }

  /**
   * Read a JSON value.
   *
   * In plain words: returns what was saved, or null when the key is missing or expired.
   *
   * @param key Key without the prefix
   * @returns The value, or null
   * @throws CacheUnavailableException when Redis cannot be reached
   * @dependencies Redis.get
   */
  async getJson<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.guard(() => this.client.get(this.k(key)));
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  /**
   * Save a JSON value for a number of seconds.
   *
   * In plain words: keeps the value for `ttlSeconds`, then Redis removes it.
   *
   * @param key Key without the prefix
   * @param value Any JSON-safe value
   * @param ttlSeconds Life in seconds
   * @returns Nothing
   * @throws CacheUnavailableException when Redis cannot be reached
   * @dependencies Redis.set
   */
  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.guard(() => this.client.set(this.k(key), JSON.stringify(value), 'EX', ttlSeconds));
  }

  /**
   * Count one call in a time window.
   *
   * In plain words: adds one to a counter that Redis removes after the window; the first call starts the window.
   *
   * @param key Key without the prefix
   * @param windowSeconds Length of the window in seconds
   * @returns The count including this call and the seconds left in the window
   * @throws CacheUnavailableException when Redis cannot be reached
   * @dependencies Redis.incr, Redis.expire, Redis.ttl
   */
  async increment(key: string, windowSeconds: number): Promise<{ count: number; ttlSeconds: number }> {
    return this.guard(async () => {
      const count = await this.client.incr(this.k(key));
      if (count === 1) await this.client.expire(this.k(key), windowSeconds);
      const ttl = await this.client.ttl(this.k(key));
      return { count, ttlSeconds: ttl > 0 ? ttl : windowSeconds };
    });
  }

  /**
   * Read a JSON value and delete it in one step.
   *
   * In plain words: gives the value once; a second read finds nothing (used for one-time values such as the sign-in state).
   *
   * @param key Key without the prefix
   * @returns The value, or null
   * @throws CacheUnavailableException when Redis cannot be reached
   * @dependencies Redis.getdel
   */
  async takeJson<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.guard(() => this.client.getdel(this.k(key)));
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  /**
   * Delete one key.
   *
   * In plain words: removes the value if it exists.
   *
   * @param key Key without the prefix
   * @returns Nothing
   * @throws CacheUnavailableException when Redis cannot be reached
   * @dependencies Redis.del
   */
  async deleteKey(key: string): Promise<void> {
    await this.guard(() => this.client.del(this.k(key)));
  }

  /**
   * Delete every key that starts with a prefix.
   *
   * In plain words: clears a group of keys, for example all `perm:user:` entries.
   *
   * @param prefix Start of the key, without the REDIS_PREFIX
   * @returns How many keys were removed
   * @throws CacheUnavailableException when Redis cannot be reached
   * @dependencies Redis.scanStream, Redis.del
   */
  async deleteByPrefix(prefix: string): Promise<number> {
    return this.guard(async () => {
      let removed = 0;
      const stream = this.client.scanStream({ match: `${this.k(prefix)}*`, count: 200 });
      for await (const keys of stream as AsyncIterable<string[]>) {
        if (keys.length > 0) removed += await this.client.del(...keys);
      }
      return removed;
    });
  }

  /**
   * List full key names that match a pattern (tests and diagnostics).
   *
   * In plain words: shows the keys exactly as stored, prefix included.
   *
   * @param pattern Full pattern including the prefix
   * @returns Matching key names
   * @throws CacheUnavailableException when Redis cannot be reached
   * @dependencies Redis.keys
   */
  async rawKeys(pattern: string): Promise<string[]> {
    return this.guard(() => this.client.keys(pattern));
  }

  /**
   * Close the connection when the application stops.
   *
   * In plain words: lets go of Redis.
   *
   * @returns Nothing
   * @dependencies Redis.disconnect
   */
  async onModuleDestroy(): Promise<void> {
    this.client.disconnect();
  }
}
