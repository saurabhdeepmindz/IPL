/**
 * @file    module.ts
 * @module  AuditModule
 *
 * @description
 * Nest module of the audit library. In plain words: other parts import this module to record changes and refusals.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-03
 */

import { Module } from '@nestjs/common';
import { AuditLogRepository } from './repositories/audit-log/contract';
import { AuditLogDatabaseRepository } from './repositories/audit-log/database';
import { AuditService } from './services/audit.service';

/**
 * Audit module.
 *
 * In plain words: gives out the audit service.
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
  providers: [{ provide: AuditLogRepository, useClass: AuditLogDatabaseRepository }, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
