/**
 * @file    module.ts
 * @module  AmsApisModule
 *
 * @description
 * Root module of the ams-apis application. In plain words: lists what this application is made of.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllFieldsValidationPipe, GlobalExceptionFilter } from '@libs/common';
import { ConfigModule } from '@nestjs/config';
import { configurations } from '@config';
import { validateEnv } from '@config/env.validation';
import { AuthorizationModule } from '@libs/core';
import { DatabaseModule } from '@libs/database';
import { DevAuthModule } from './dev-auth/dev-auth.module';
import { PermissionMatrixModule, RoleAssignmentModule, RolesAndPermissionsModule } from '@libs/roles-and-permissions';
import { UsersModule } from '@libs/users';
import { HealthController } from './controllers/health.controller';
import { PermissionMatrixController } from './controllers/permission-matrix.controller';
import { PermissionCacheBridgeModule } from './permission-cache-bridge.module';
import { RoleAssignmentController } from './controllers/role-assignment.controller';
import { UsersController } from './controllers/users.controller';
import { UsersImportController } from './controllers/users-import.controller';
import { UsersLifecycleController } from './controllers/users-lifecycle.controller';
import { MastersController } from './controllers/masters.controller';
import { OrganisationModule } from '@libs/organisation';
import { RolesController } from './controllers/roles.controller';


/**
 * Root module of ams-apis.
 *
 * In plain words: the application is assembled here.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   none (foundation work package)
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: configurations, validate: validateEnv }), DatabaseModule, AuthorizationModule, PermissionCacheBridgeModule, RolesAndPermissionsModule, PermissionMatrixModule, RoleAssignmentModule, UsersModule, OrganisationModule, DevAuthModule.register()],
  // PermissionMatrixController must come before RolesController: PUT /roles/permissions would otherwise be read as PUT /roles/:roleId (decision L-27).
  controllers: [HealthController, PermissionMatrixController, RolesController, RoleAssignmentController, UsersController, UsersLifecycleController, UsersImportController, MastersController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_PIPE, useClass: AllFieldsValidationPipe },
  ],
})
export class AmsApisModule {}
