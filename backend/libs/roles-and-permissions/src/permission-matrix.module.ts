/**
 * @file    permission-matrix.module.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Module of the permission matrix service. In plain words: kept apart from `RolesAndPermissionsModule` because it needs the cache port `PermissionCacheInvalidator`, which the application provides (decision L-22); every other user of the roles library is unaffected.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/permission-matrix.module.ts
 * @lld-synced     v0.20
 * @status         built
 */

import { Module } from '@nestjs/common';
import { AuditModule } from '@libs/audit';
import { RolesAndPermissionsModule } from './module';
import { MatrixChangeAnalyzer } from './services/matrix-change-analyzer';
import { PermissionMatrixService } from './services/permission-matrix.service';

/**
 * Permission matrix module.
 *
 * In plain words: the application that imports it must also provide `PermissionCacheInvalidator` (a global provider).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-01, API-PRM-02, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.20 section 6.6
 */
@Module({
  imports: [RolesAndPermissionsModule, AuditModule],
  providers: [MatrixChangeAnalyzer, PermissionMatrixService],
  exports: [PermissionMatrixService],
})
export class PermissionMatrixModule {}
