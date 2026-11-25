/**
 * @file    authorization.module.ts
 * @module  AuthorizationModule
 *
 * @description
 * Wires the authorization pieces into the application. In plain words: switches the two guards on for every route.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.13 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.13.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/authorization.module.ts
 * @lld-synced     v0.13
 * @status         built
 */

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuditModule } from '@libs/audit';
import { OrganisationModule } from '@libs/organisation';
import { RolesAndPermissionsModule } from '@libs/roles-and-permissions';
import { AuthCoreModule, JwtAuthGuard } from '../auth';
import { RedisModule } from '../redis';
import { CompanyGuard } from './company.guard';
import { DataScopeFilter } from './data-scope.filter';
import { PermissionCache } from './permission.cache';
import { PermissionGuard } from './permission.guard';
import { PermissionResolver } from './permission-resolver.service';

/**
 * Authorization module.
 *
 * In plain words: one import in the application turns on the permission and company checks everywhere.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none (all)
 *   lld:       LLD-EPIC-ADM-01 v0.13 §6.8
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-02
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.13 §6.8
 * @status    built
 *
 * @dependencies PermissionGuard, CompanyGuard, PermissionResolver, PermissionCache, DataScopeFilter, AuditModule
 */
@Module({
  imports: [AuditModule, AuthCoreModule, OrganisationModule, RolesAndPermissionsModule, RedisModule],
  providers: [
    PermissionResolver,
    PermissionCache,
    DataScopeFilter,
    // The authentication guard runs first (guards run in the order they are listed). The sign-in epic replaces it (TBD-ADM01-02).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: CompanyGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
  exports: [PermissionResolver, PermissionCache, DataScopeFilter],
})
export class AuthorizationModule {}
