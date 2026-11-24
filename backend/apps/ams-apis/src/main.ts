/**
 * @file    main.ts
 * @module  AmsApis
 *
 * @description
 * Starts the AMS API. In plain words: opens the web door of the back end.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AmsApisModule } from './module';

/**
 * Starts the HTTP server on the configured port, under the prefix api/v1.
 *
 * In plain words: this is what runs when the API application starts.
 *
 * @async
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AmsApisModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3001').split(',').map((s) => s.trim()),
    credentials: true,
  });
  await app.listen(Number(process.env.APP_PORT ?? 3000));
}

void bootstrap();
