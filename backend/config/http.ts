/**
 * @file    http.ts
 * @module  Config
 *
 * @description
 * HTTP settings. In plain words: which web addresses may call the API.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { registerAs } from '@nestjs/config';

export default registerAs('http', () => ({
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3001').split(',').map((s) => s.trim()),
  prefix: 'api/v1',
}));
