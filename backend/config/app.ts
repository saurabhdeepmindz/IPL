/**
 * @file    app.ts
 * @module  Config
 *
 * @description
 * Application settings. In plain words: name, environment and port.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'ams',
  env: process.env.APP_ENV ?? 'dev',
  port: Number(process.env.APP_PORT ?? 3000),
  webBaseUrl: process.env.WEB_BASE_URL ?? 'http://localhost:3001',
}));
