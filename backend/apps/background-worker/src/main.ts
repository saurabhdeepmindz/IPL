/**
 * @file    main.ts
 * @module  BackgroundWorker
 *
 * @description
 * Starts the background-worker application. In plain words: the entry point; the work for this application arrives with later epics.
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
import { BackgroundWorkerModule } from './module';
import { MailProcessor } from './processors/mail.processor';

/**
 * Starts the application context (no web server yet).
 *
 * In plain words: starts the mail worker, which sends the e-mails that the other applications queue.
 *
 * @async
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(BackgroundWorkerModule);
  app.enableShutdownHooks();
  app.get(MailProcessor).start();
}

void bootstrap();
