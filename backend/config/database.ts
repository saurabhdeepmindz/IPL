/**
 * @file    database.ts
 * @module  Config
 *
 * @description
 * Database settings. In plain words: the connection string for PostgreSQL.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL ?? '',
}));
