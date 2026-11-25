/**
 * @file    index.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Exports of the role repository folder. In plain words: the contract and its Prisma implementation.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/role/index.ts
 * @lld-synced     v0.30
 * @status         built
 */

export * from './contract';
export * from './database';
