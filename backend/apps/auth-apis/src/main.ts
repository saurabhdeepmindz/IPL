/**
 * @file    main.ts
 * @module  AuthApis
 *
 * @description
 * Starts the Auth API. In plain words: the entry point of the new application `apps/auth-apis`, with the same global filter, validation pipe and prefix as the main API.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-000
 * @subtask        ST-LGN01-000-BE-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/apps/auth-apis/src/main.ts
 * @lld-synced     v0.5
 * @status         built
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AuthApisModule } from './module';

/**
 * Starts the Auth API.
 *
 * In plain words: the same prefix (`api/v1`), error filter and validation as the main API, on its own port (`AUTH_PORT`, 3200 in development).
 */
export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AuthApisModule);
  app.setGlobalPrefix('api/v1');
  app.set('trust proxy', 1);
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3001').split(',').map((s) => s.trim()),
    credentials: true,
  });
  await app.listen(Number(process.env.AUTH_PORT ?? 3200));
}

void bootstrap();
