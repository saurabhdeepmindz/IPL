/**
 * @file    module.ts
 * @module  UsersModule
 *
 * @description
 * Users, one-time passwords and the user services. In plain words: the switch that makes this library available to an application.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { Module } from '@nestjs/common';
import { UserDatabaseRepository, UserRepository } from './repositories/user';

/**
 * Nest module of the users library.
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
@Module({
  providers: [{ provide: UserRepository, useClass: UserDatabaseRepository }],
  exports: [UserRepository],
})
export class UsersModule {}
