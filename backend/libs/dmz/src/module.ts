/**
 * @file    module.ts
 * @module  DmzModule
 *
 * @description
 * Application boundary helpers: REST bootstrap and the console runner. In plain words: the switch that makes this library available to an application.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { Module } from '@nestjs/common';

/**
 * Nest module of the dmz library.
 *
 * In plain words: other parts import this module to use the library.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   none (foundation work package)
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Module({})
export class DmzModule {}
