/**
 * @file    auth-core.module.ts
 * @module  CoreModule
 *
 * @description
 * Wires the token service, the guard and the stand-in sign-in. In plain words: import it where sign-in or the guard is needed.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-06
 */

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OrganisationModule } from '@libs/organisation';
import { DevSignInService } from './dev-sign-in.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionUserFactory } from './session-user.factory';

/**
 * Auth core module.
 *
 * In plain words: token signing uses JWT_SECRET from the environment.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Module({
  imports: [
    OrganisationModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('auth.jwtSecret') }),
    }),
  ],
  providers: [DevSignInService, JwtAuthGuard, SessionUserFactory],
  exports: [DevSignInService, JwtAuthGuard, SessionUserFactory, JwtModule],
})
export class AuthCoreModule {}
