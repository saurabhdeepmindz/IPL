/**
 * @file    dev-auth.module.ts
 * @module  AmsApis
 *
 * @description
 * Registers the development sign-in route only in dev and test. In plain words: in uat and prod this module is empty, so the route does not exist.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-06
 */

import { DynamicModule, Module } from '@nestjs/common';
import { AuthCoreModule, AuthorizationModule } from '@libs/core';
import { DevProbeController } from '../controllers/dev/dev-probe.controller';
import { DevAuthController } from '../controllers/dev/dev-auth.controller';

/**
 * Development auth module.
 *
 * In plain words: `DevAuthModule.register()` reads APP_ENV; dev and test get the controller, everything else gets nothing.
 *
 * TBD-ADM01-02: remove with the stand-in when the sign-in epic is built.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Module({})
export class DevAuthModule {
  /**
   * Build the module for an environment.
   *
   * In plain words: the route exists only when the environment is dev or test.
   *
   * @param appEnv Value of APP_ENV (dev when not set)
   * @returns A module with the controller, or an empty one
   * @dependencies none
   */
  static register(appEnv: string = process.env.APP_ENV ?? 'dev'): DynamicModule {
    if (!['dev', 'test'].includes(appEnv)) return { module: DevAuthModule };
    return { module: DevAuthModule, imports: [AuthCoreModule, AuthorizationModule], controllers: [DevAuthController, DevProbeController] };
  }
}
