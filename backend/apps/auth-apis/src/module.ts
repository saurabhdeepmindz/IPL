/**
 * @file    module.ts
 * @module  AuthApis
 *
 * @description
 * Wires the Auth API. In plain words: the Nest module that joins controllers, services and the library modules of the Auth API.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-000
 * @subtask        ST-LGN01-000-BE-01
 * @lld            LLD-EPIC-LGN-01 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/apps/auth-apis/src/module.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { configurations } from '@config';
import { validateEnv } from '@config/env.validation';
import { AllFieldsValidationPipe, GlobalExceptionFilter } from '@libs/common';
import { SignInModule } from '@libs/core';
import { DatabaseModule } from '@libs/database';
import { SettingsModule } from '@libs/settings';
import { AuthController } from './controllers/auth.controller';
import { HealthController } from './controllers/health.controller';
import { PublicConfigTransformer } from './transformer/public-config.transformer';
import { SignInResponseTransformer } from './transformer/sign-in-response.transformer';

/**
 * AuthApisModule.
 *
 * In plain words: joins the routes and the sign-in services of the Auth API. Later epics add PasswordController (EPIC-LGN-02) and SessionController (EPIC-LGN-04).
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: configurations, validate: validateEnv }), DatabaseModule, SignInModule, SettingsModule],
  controllers: [AuthController, HealthController],
  providers: [
    PublicConfigTransformer,
    SignInResponseTransformer,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_PIPE, useClass: AllFieldsValidationPipe },
  ],
})
export class AuthApisModule {}
