/**
 * @file    prisma.config.ts
 * @module  Prisma
 *
 * @description
 * Tells the Prisma tools where the schema, the migrations and the database are. In plain words: the database address comes from the environment, never from a file.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-02
 */

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'ts-node prisma/seed.ts' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
