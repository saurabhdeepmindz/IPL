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
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.8
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/index.ts
 * @lld-synced     v0.30
 * @status         built
 */

export * from './authorization.module';
export * from './require-permission.decorator';
export * from './public.decorator';
export * from './session-route.decorator';
export * from './permission.guard';
export * from './company.guard';
export * from './permission.cache';
export * from './permission-resolver.service';
export * from './data-scope.filter';
export * from './session-user.interface';
