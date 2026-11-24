/**
 * @file    index.ts
 * @module  DatabaseModule
 *
 * @description
 * Public exports of the database library.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

export * from './module';
export * from './prisma.service';
export * from './company-context';
export * from './extensions/company-filter.extension';
export * from './generated/enums';
export { Prisma } from './generated/client';
