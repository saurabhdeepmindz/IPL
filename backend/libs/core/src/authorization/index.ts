/**
 * @file    index.ts
 * @module  AuthorizationModule
 *
 * @description
 * Public exports of the authorization module.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-017
 * @lld            LLD-EPIC-ADM-01 v0.12 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.12.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/index.ts
 * @lld-synced     v0.12
 * @status         built
 */

export * from './authorization.module';
export * from './require-permission.decorator';
export * from './public.decorator';
export * from './permission.guard';
export * from './company.guard';
export * from './permission.cache';
export * from './permission-resolver.service';
export * from './data-scope.filter';
export * from './session-user.interface';
