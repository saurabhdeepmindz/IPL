/**
 * @file    role-assignment.module.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Module of the role assignment service. In plain words: kept apart from `RolesAndPermissionsModule` because it needs the cache port, which the application provides (decision L-30).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.14 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.14.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/role-assignment.module.ts
 * @lld-synced     v0.14
 * @status         built
 */

import { Module } from '@nestjs/common';
import { AuditModule } from '@libs/audit';
import { OrganisationModule } from '@libs/organisation';
import { UsersModule } from '@libs/users';
import { RolesAndPermissionsModule } from './module';
import { RoleAssignmentService } from './services/role-assignment.service';

/**
 * Role assignment module.
 *
 * In plain words: the application that imports it must also provide `PermissionCacheInvalidator` (a global provider).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-05, API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.14 §6.4
 */
@Module({
  imports: [RolesAndPermissionsModule, AuditModule, OrganisationModule, UsersModule],
  providers: [RoleAssignmentService],
  exports: [RoleAssignmentService],
})
export class RoleAssignmentModule {}
