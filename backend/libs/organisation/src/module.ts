/**
 * @file    module.ts
 * @module  OrganisationModule
 *
 * @description
 * Nest module of the organisation library. In plain words: other parts import this module to use the library.
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
import { MastersReadDatabaseRepository, MastersReadRepository } from './repositories/masters-read';
import { MastersReadService } from './services/masters-read.service';
import { UserCompanyRoleRepository } from './repositories/user-company-role/contract';
import { UserCompanyRoleDatabaseRepository } from './repositories/user-company-role/database';

/**
 * Organisation module.
 *
 * In plain words: gives out the repository that reads roles of users.
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
  providers: [{ provide: UserCompanyRoleRepository, useClass: UserCompanyRoleDatabaseRepository }, { provide: MastersReadRepository, useClass: MastersReadDatabaseRepository }, MastersReadService],
  exports: [UserCompanyRoleRepository, MastersReadService],
})
export class OrganisationModule {}
