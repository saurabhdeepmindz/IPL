/**
 * @file    permission-cache-bridge.module.ts
 * @module  AmsApis
 *
 * @description
 * Gives the roles library's cache port its implementation. In plain words: when the matrix is saved, `PermissionMatrixService` asks the port to forget every remembered permission answer; here the port is wired to the real `PermissionCache` of the core library (decision L-22).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/permission-cache-bridge.module.ts
 * @lld-synced     v0.26
 * @status         built
 */

import { Global, Module } from '@nestjs/common';
import { AuthorizationModule, PermissionCache } from '@libs/core';
import { PermissionCacheInvalidator } from '@libs/roles-and-permissions';

/**
 * Permission cache bridge module.
 *
 * In plain words: one provider, visible to every module (global), that points the port at `PermissionCache`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.26 section 6.6
 */
@Global()
@Module({
  imports: [AuthorizationModule],
  providers: [{ provide: PermissionCacheInvalidator, useExisting: PermissionCache }],
  exports: [PermissionCacheInvalidator],
})
export class PermissionCacheBridgeModule {}
