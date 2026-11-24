/**
 * @file    cache.ts
 * @module  Config
 *
 * @description
 * Redis settings. In plain words: where the cache and the session store live.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  prefix: process.env.REDIS_PREFIX ?? 'ams',
}));
