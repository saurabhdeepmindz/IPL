/**
 * @file    redis.service.spec.ts
 * @module  CoreModule
 *
 * @description
 * Supporting tests of ST-ADM01-000-BE-05, written before the code. They run against the real Redis of docker-compose.
 * In plain words: values can be saved and read back, they expire, a prefix delete removes only its own keys, and a stopped Redis gives a clear typed error.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-05
 */

import { RedisService } from './redis.service';
import { CacheUnavailableException } from './cache-unavailable.exception';

const run = Date.now().toString(36);
const options = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  prefix: `test-${run}`,
};

describe('ST-ADM01-000-BE-05 Redis helpers', () => {
  let redis: RedisService;

  beforeAll(() => {
    redis = new RedisService(options);
  });

  afterAll(async () => {
    await redis.deleteByPrefix('');
    await redis.onModuleDestroy();
  });

  it('set then get returns the value', async () => {
    await redis.setJson('a:1', { n: 1, t: 'x' }, 30);
    expect(await redis.getJson('a:1')).toEqual({ n: 1, t: 'x' });
  });

  it('a missing key returns null', async () => {
    expect(await redis.getJson('nothing')).toBeNull();
  });

  it('a key expires after its life', async () => {
    await redis.setJson('short', 'v', 1);
    await new Promise((r) => setTimeout(r, 1300));
    expect(await redis.getJson('short')).toBeNull();
  });

  it('deleteByPrefix removes only matching keys', async () => {
    await redis.setJson('perm:user:1', 1, 30);
    await redis.setJson('perm:user:2', 2, 30);
    await redis.setJson('other:3', 3, 30);
    const removed = await redis.deleteByPrefix('perm:user:');
    expect(removed).toBe(2);
    expect(await redis.getJson('other:3')).toBe(3);
  });

  it('every key is written under the REDIS_PREFIX', async () => {
    await redis.setJson('keycheck', 1, 30);
    const raw = await redis.rawKeys(`${options.prefix}:keycheck`);
    expect(raw).toEqual([`${options.prefix}:keycheck`]);
  });

  it('a stopped Redis gives the typed exception', async () => {
    const dead = new RedisService({ host: 'localhost', port: 6399, prefix: 'x' });
    await expect(dead.getJson('k')).rejects.toBeInstanceOf(CacheUnavailableException);
    await dead.onModuleDestroy();
  });
});
