/**
 * @file    company-selection.module.ts
 * @module  AuthCoreModule
 *
 * @description
 * Nest module of the company selection. In plain words: gathers the company selection service and what it needs, so the AMS API imports one module for the `/me` routes.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-001, US-LGN03-002
 * @subtask        ST-LGN03-001-BE-02
 * @lld            LLD-EPIC-LGN-03 v0.2 §6.0 (change recorded in the next LLD version)
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.2.md
 * @status         built
 */

import { Module } from '@nestjs/common';
import { AuditModule } from '@libs/audit';
import { OrganisationModule } from '@libs/organisation';
import { SettingsModule } from '@libs/settings';
import { UsersModule } from '@libs/users';
import { RedisModule } from '../redis';
import { AuthCoreModule } from './auth-core.module';
import { CompanySelectionService } from './company-selection.service';
import { LandingResolver } from './landing.resolver';
import { SessionContextService } from './session-context.service';
import { TokenService } from './token.service';

/**
 * CompanySelectionModule.
 *
 * In plain words: provides CompanySelectionService with the organisation, users and settings libraries.
 *
 * @rtm
 *   epics:     EPIC-LGN-03
 *   stories:   US-LGN03-001, US-LGN03-002
 *   workflows: UF-03
 *   contracts: API-ME-01, API-ME-02
 *   ac:        AC-US-LGN03-001-01
 *   lld:       LLD-EPIC-LGN-03 v0.2 section 6.0
 */
@Module({
  imports: [OrganisationModule, UsersModule, SettingsModule, AuditModule, RedisModule, AuthCoreModule],
  providers: [CompanySelectionService, SessionContextService, LandingResolver, TokenService],
  exports: [CompanySelectionService],
})
export class CompanySelectionModule {}
