/**
 * @file    module.ts
 * @module  AmsApisModule
 *
 * @description
 * Root module of the ams-apis application. In plain words: lists what this application is made of.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllFieldsValidationPipe, GlobalExceptionFilter } from '@libs/common';
import { ConfigModule } from '@nestjs/config';
import { configurations } from '@config';
import { validateEnv } from '@config/env.validation';
import { AuthorizationModule } from '@libs/core';
import { DatabaseModule } from '@libs/database';
import { DevAuthModule } from './dev-auth/dev-auth.module';
import { RolesAndPermissionsModule } from '@libs/roles-and-permissions';
import { HealthController } from './controllers/health.controller';
import { RolesController } from './controllers/roles.controller';


/**
 * Root module of ams-apis.
 *
 * In plain words: the application is assembled here.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   none (foundation work package)
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: configurations, validate: validateEnv }), DatabaseModule, AuthorizationModule, RolesAndPermissionsModule, DevAuthModule.register()],
  controllers: [HealthController, RolesController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_PIPE, useClass: AllFieldsValidationPipe },
  ],
})
export class AmsApisModule {}
