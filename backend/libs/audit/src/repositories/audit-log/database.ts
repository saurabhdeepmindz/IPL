/**
 * @file    database.ts
 * @module  AuditModule
 *
 * @description
 * Prisma implementation of the audit-log repository. In plain words: the only file in this library that talks to the database.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-03
 */

import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@libs/database';
import { AuditLogRepository, AuditRow } from './contract';

/**
 * Database implementation of AuditLogRepository.
 *
 * In plain words: inserts into the audit_log table.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Injectable()
export class AuditLogDatabaseRepository extends AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** {@inheritDoc AuditLogRepository.add} */
  async add(row: AuditRow): Promise<void> {
    await this.prisma.raw.auditLog.create({
      data: {
        actor: row.actor,
        companyCode: row.companyCode ?? null,
        kind: row.kind,
        entity: row.entity ?? null,
        entityKey: row.entityKey ?? null,
        before: (row.before ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        after: (row.after ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        reason: row.reason ?? null,
        permissionKey: row.permissionKey ?? null,
        code: row.code ?? null,
      },
    });
  }
}
