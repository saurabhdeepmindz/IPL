/**
 * @file    module.ts
 * @module  ControlPanel
 *
 * @description
 * Module of the control-panel application. In plain words: the command line tool for set-up work such as seeds.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-07
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configurations } from '@config';
import { DatabaseModule } from '@libs/database';
import { SeedAdminCommand, SeedMastersCommand, SeedRolesCommand } from './commands';

/**
 * Control panel module.
 *
 * In plain words: holds the seed commands. Run them with `npm run cp -- seed:roles`.
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
  imports: [ConfigModule.forRoot({ isGlobal: true, load: configurations }), DatabaseModule],
  providers: [SeedRolesCommand, SeedMastersCommand, SeedAdminCommand],
})
export class ControlPanelModule {}
