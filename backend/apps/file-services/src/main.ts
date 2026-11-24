/**
 * @file    main.ts
 * @module  FileServices
 *
 * @description
 * Starts the file-services application. In plain words: the entry point; the work for this application arrives with later epics.
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
import { FileServicesModule } from './module';

/**
 * Starts the application context (no web server yet).
 *
 * In plain words: this application has nothing to do until a later epic gives it work.
 *
 * @async
 */
async function bootstrap(): Promise<void> {
  await NestFactory.createApplicationContext(FileServicesModule);
}

void bootstrap();
