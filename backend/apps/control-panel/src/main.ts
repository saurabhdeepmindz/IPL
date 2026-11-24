/**
 * @file    main.ts
 * @module  ControlPanel
 *
 * @description
 * Starts the control-panel command line. In plain words: reads the command name, runs it, prints a short result and exits. No password is ever printed.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-07
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ControlPanelModule } from './module';
import { SeedAdminCommand, SeedMastersCommand, SeedRolesCommand } from './commands';

/**
 * Runs one command by name.
 *
 * In plain words: `seed:roles`, `seed:masters`, `seed:admin`, or `seed:all` (masters, roles, admin in that order).
 *
 * @async
 */
async function bootstrap(): Promise<void> {
  const name = process.argv[2];
  const app = await NestFactory.createApplicationContext(ControlPanelModule, { logger: ['error', 'warn'] });
  try {
    const out: Record<string, unknown> = {};
    if (name === 'seed:masters' || name === 'seed:all') out.masters = await app.get(SeedMastersCommand).run();
    if (name === 'seed:roles' || name === 'seed:all') out.roles = await app.get(SeedRolesCommand).run();
    if (name === 'seed:admin' || name === 'seed:all') out.admin = await app.get(SeedAdminCommand).run();
    if (Object.keys(out).length === 0) throw new Error(`Unknown command "${name ?? ''}". Use seed:roles, seed:masters, seed:admin or seed:all`);
    console.log(JSON.stringify(out));
  } finally {
    await app.close();
  }
}

bootstrap().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
