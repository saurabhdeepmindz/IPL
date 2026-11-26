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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuditModule } from '@libs/audit';
import { MailmanModule } from '@libs/mailman';
import { OneTimePasswordDatabaseRepository, OneTimePasswordRepository } from './repositories/one-time-password';
import { UserDatabaseRepository, UserRepository } from './repositories/user';
import { OrganisationModule } from '@libs/organisation';
import { MastersDatabaseAdapter } from '@libs/organisation/repositories/masters/database';
import { UserFormDatabaseRepository, UserFormRepository } from './repositories/user-form';
import { UserPasswordWrites, UserWriteDatabaseRepository, UserWriteRepository } from './repositories/user-write';
import { DelegationPort } from './ports/delegation.port';
import { DelegationStandIn } from './ports/delegation.stand-in';
import { MastersPort } from './ports/masters.port';
import { SessionRevocationPort } from './ports/session-revocation.port';
import { SessionRevocationStandIn } from './ports/session-revocation.stand-in';
import { WorkflowPort } from './ports/workflow.port';
import { WorkflowStandIn } from './ports/workflow.stand-in';
import { TemporaryPasswordMailer } from './ports/temporary-password-mailer.port';
import { RealTemporaryPasswordMailer } from './ports/temporary-password-mailer.real';
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
  imports: [ConfigModule, AuditModule, OrganisationModule, MailmanModule],
  providers: [
    { provide: UserRepository, useClass: UserDatabaseRepository },
    { provide: UserWriteRepository, useClass: UserWriteDatabaseRepository },
    { provide: UserPasswordWrites, useExisting: UserWriteRepository },
    { provide: UserFormRepository, useClass: UserFormDatabaseRepository },
    { provide: OneTimePasswordRepository, useClass: OneTimePasswordDatabaseRepository },
    UsersQueryService,
    RealTemporaryPasswordMailer,
    TemporaryPasswordMailerStandIn,
    // The real mailer is used when MAIL_TRANSPORT is set (ses, smtp or log); without it the stand-in answers (development and the earlier tests). Decision S-4 of US-LGN02-005.
    {
      provide: TemporaryPasswordMailer,
      useFactory: (config: ConfigService, real: RealTemporaryPasswordMailer, standIn: TemporaryPasswordMailerStandIn) => (config.get('MAIL_TRANSPORT') ? real : standIn),
      inject: [ConfigService, RealTemporaryPasswordMailer, TemporaryPasswordMailerStandIn],
    },
    PasswordHasher,
    OneTimePasswordService,
    UsersLifecycleService,
    { provide: MastersPort, useClass: MastersDatabaseAdapter },
    { provide: WorkflowPort, useClass: WorkflowStandIn },
    { provide: DelegationPort, useClass: DelegationStandIn },
    { provide: SessionRevocationPort, useClass: SessionRevocationStandIn },
    UserInputValidator,
    UsersCommandService,
  ],
  exports: [PasswordHasher, UserRepository, UserWriteRepository, UserPasswordWrites, UserFormRepository, OneTimePasswordRepository, UsersQueryService, OneTimePasswordService, UsersLifecycleService, UsersCommandService],
})
export class UsersModule {}
