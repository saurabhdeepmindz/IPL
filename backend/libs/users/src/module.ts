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
import { AuditModule } from '@libs/audit';
import { OneTimePasswordDatabaseRepository, OneTimePasswordRepository } from './repositories/one-time-password';
import { UserDatabaseRepository, UserRepository } from './repositories/user';
import { OrganisationModule } from '@libs/organisation';
import { MastersDatabaseAdapter } from '@libs/organisation/repositories/masters/database';
import { UserWriteDatabaseRepository, UserWriteRepository } from './repositories/user-write';
import { MastersPort } from './ports/masters.port';
import { TemporaryPasswordMailer } from './ports/temporary-password-mailer.port';
import { TemporaryPasswordMailerStandIn } from './ports/temporary-password-mailer.stand-in';
import { OneTimePasswordService } from './services/one-time-password.service';
import { PasswordHasher } from './services/password-hasher';
import { UserInputValidator } from './services/user-input-validator';
import { UsersCommandService } from './services/users-command.service';
import { UsersLifecycleService } from './services/users-lifecycle.service';
import { UsersQueryService } from './services/users-query.service';

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
  imports: [AuditModule, OrganisationModule],
  providers: [
    { provide: UserRepository, useClass: UserDatabaseRepository },
    { provide: UserWriteRepository, useClass: UserWriteDatabaseRepository },
    { provide: OneTimePasswordRepository, useClass: OneTimePasswordDatabaseRepository },
    UsersQueryService,
    { provide: TemporaryPasswordMailer, useClass: TemporaryPasswordMailerStandIn },
    PasswordHasher,
    OneTimePasswordService,
    UsersLifecycleService,
    { provide: MastersPort, useClass: MastersDatabaseAdapter },
    UserInputValidator,
    UsersCommandService,
  ],
  exports: [UserRepository, UserWriteRepository, OneTimePasswordRepository, UsersQueryService, OneTimePasswordService, UsersLifecycleService, UsersCommandService],
})
export class UsersModule {}
