/**
 * @file    permission.cache.spec.ts
 * @module  AuthorizationModule
 *
 * @description
 * Supporting tests of the permission cache (Jest). Written before the code (TDD). They have no test-case ID of their own: they carry AC-US017-01 (decision ST-02).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.16 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.16.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/permission.cache.ts
 * @lld-synced     v0.16
 * @status         built
 */
import { PermissionCache, roleCellsKey, userRolesKey } from './permission.cache';

/** A small in-memory stand-in for RedisService. */
class FakeRedis {
  store = new Map<string, unknown>();
  ttl: number | undefined;
  failing = false;
  private check(): void {
    if (this.failing) throw new Error('redis down');
  }
  async getJson(key: string): Promise<unknown> {
    this.check();
    return this.store.has(key) ? this.store.get(key) : null;
  }
  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    this.check();
    this.ttl = ttlSeconds;
    this.store.set(key, value);
  }
  async deleteByPrefix(prefix: string): Promise<number> {
    this.check();
    let n = 0;
    for (const k of [...this.store.keys()]) {
      if (k.startsWith(prefix)) {
        this.store.delete(k);
        n += 1;
      }
    }
    return n;
  }
}

describe('PermissionCache', () => {
  let redis: FakeRedis;
  let cache: PermissionCache;
  beforeEach(() => {
    redis = new FakeRedis();
    cache = new PermissionCache(redis as never);
  });

  /**
   * @story   US-ADM01-017
   * @ac      AC-US017-01
   * @subtask ST-ADM01-017-BE-05
   * In plain words: what was stored comes back, and it is stored for 60 seconds.
   */
  it('returns a stored value and stores it for 60 seconds', async () => {
    await cache.set(userRolesKey('u1', 'IPL'), ['r1']);
    expect(await cache.get(userRolesKey('u1', 'IPL'))).toEqual(['r1']);
    expect(redis.ttl).toBe(60);
  });

  /**
   * @story   US-ADM01-017
   * @ac      AC-US017-01
   * @subtask ST-ADM01-017-BE-05
   * In plain words: a key that is missing or has expired gives nothing.
   */
  it('returns null for a missing key', async () => {
    expect(await cache.get(roleCellsKey('nope'))).toBeNull();
  });

  /**
   * @story   US-ADM01-017
   * @ac      AC-US017-01
   * @subtask ST-ADM01-017-BE-05
   * In plain words: when Redis is down the cache gives nothing and never throws, so a call is not blocked.
   */
  it('gives null and does not throw when Redis fails', async () => {
    redis.failing = true;
    await expect(cache.get('perm:x')).resolves.toBeNull();
    await expect(cache.set('perm:x', 1)).resolves.toBeUndefined();
  });

  /**
   * @story   US-ADM01-017
   * @ac      AC-US017-01
   * @subtask ST-ADM01-017-BE-05
   * In plain words: clearAll forgets both kinds of key.
   */
  it('clearAll removes both key kinds', async () => {
    await cache.set(userRolesKey('u1', 'IPL'), ['r1']);
    await cache.set(roleCellsKey('r1'), []);
    await cache.clearAll();
    expect(redis.store.size).toBe(0);
  });

  /**
   * @story   US-ADM01-017
   * @ac      AC-US017-01
   * @subtask ST-ADM01-017-BE-05
   * In plain words: clearUser forgets that user only.
   */
  it('clearUser removes only that user keys', async () => {
    await cache.set(userRolesKey('u1', 'IPL'), ['r1']);
    await cache.set(userRolesKey('u1', 'IPLFB'), ['r1']);
    await cache.set(userRolesKey('u2', 'IPL'), ['r2']);
    await cache.set(roleCellsKey('r1'), []);
    await cache.clearUser('u1');
    expect([...redis.store.keys()].sort()).toEqual([roleCellsKey('r1'), userRolesKey('u2', 'IPL')].sort());
  });
});
