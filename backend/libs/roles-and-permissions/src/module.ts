/**
 * @file    module.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Nest module of the roles-and-permissions library. In plain words: other parts import this module to use the library.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-08
 */

import { Module } from '@nestjs/common';
import { RolePermissionRepository } from './repositories/role-permission/contract';
import { RolePermissionDatabaseRepository } from './repositories/role-permission/database';

/**
 * Roles and permissions module.
 *
 * In plain words: gives out the repository that reads the cells of a role.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Module({
  providers: [{ provide: RolePermissionRepository, useClass: RolePermissionDatabaseRepository }],
  exports: [RolePermissionRepository],
})
export class RolesAndPermissionsModule {}
