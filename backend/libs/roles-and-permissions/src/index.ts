/**
 * @file    index.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Exports of the roles-and-permissions library. In plain words: one import line.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-08
 */

export * from './module';
export * from './repositories/role';
export * from './repositories/role-permission';
export * from './services/roles.service';
export * from './constants/protected-rights';
export * from './errors/role-in-use.exception';
export * from './errors/role-locked.exception';
export * from './errors/role-name-exists.exception';
