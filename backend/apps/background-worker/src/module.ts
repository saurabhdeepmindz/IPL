/**
 * @file    module.ts
 * @module  BackgroundWorkerModule
 *
 * @description
 * Root module of the background-worker application. In plain words: lists what this application is made of.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configurations } from '@config';
import { validateEnv } from '@config/env.validation';
import { DatabaseModule } from '@libs/database';
import { MAIL_TEMPLATES, MailTemplates, MailmanModule } from '@libs/mailman';
import { composeOneTimePassword } from './mailMessages/one-time-password.message';
import { composeResetLink } from './mailMessages/reset-link.message';
import { MailProcessor } from './processors/mail.processor';

/** The e-mail templates by message name. */
const templates: MailTemplates = { 'reset-link': composeResetLink, 'one-time-password': composeOneTimePassword };

/**
 * Root module of background-worker.
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
  imports: [ConfigModule.forRoot({ isGlobal: true, load: configurations, validate: validateEnv }), DatabaseModule, MailmanModule],
  providers: [MailProcessor, { provide: MAIL_TEMPLATES, useValue: templates }],
})
export class BackgroundWorkerModule {}
