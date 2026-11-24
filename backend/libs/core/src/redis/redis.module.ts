/**
 * @file    redis.module.ts
 * @module  CoreModule
 *
 * @description
 * Makes RedisService available. In plain words: the connection settings come from REDIS_HOST, REDIS_PORT and REDIS_PREFIX.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-05
 */

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REDIS_OPTIONS, RedisOptions, RedisService } from './redis.service';

/**
 * Redis module.
 *
 * In plain words: import once; the service is then available everywhere.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_OPTIONS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): RedisOptions => config.getOrThrow<RedisOptions>('cache'),
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
