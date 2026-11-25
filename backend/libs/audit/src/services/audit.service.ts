/**
 * @file    audit.service.ts
 * @module  AuditModule
 *
 * @description
 * The audit service: records data changes and refused calls. In plain words: every change and every refusal leaves one row; passwords, tokens and one-time passwords never reach it; a refusal never breaks the request.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-03
 */

import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from '../repositories/audit-log/contract';

const SECRET_NAMES = /^(password|passwordhash|token|accesstoken|refreshtoken|otp|onetimepassword|secret)$/i;

/**
 * Remove secret fields from any value, however deep.
 *
 * In plain words: a field named password, token or otp is replaced by a marker before the value is stored.
 *
 * @param value Any JSON-like value
 * @returns A copy with the secret fields masked
 * @dependencies none
 */
export function stripSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSecrets);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SECRET_NAMES.test(k) ? '[removed]' : stripSecrets(v)]),
    );
  }
  return value;
}

/** What a change record needs. */
export interface ChangeRecord {
  actor: string;
  companyCode?: string;
  entity: string;
  entityKey: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
}

/** What a refusal record needs. */
export interface RefusalRecord {
  userId: string;
  companyCode: string;
  permissionKey: string;
  code: string;
}

/**
 * Audit service.
 *
 * In plain words: call recordChange inside the transaction that changes data; call recordRefusal when a call is refused.
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
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly rows: AuditLogRepository) {}

  /**
   * Record one change of business data.
   *
   * In plain words: writes who changed what, with the values before and after and the reason. If writing fails the error goes to the caller, whose transaction decides.
   *
   * @param record The change
   * @returns The id of the audit row (US-ADM01-014 hands it back as `auditId`)
   * @dependencies AuditLogRepository.add, stripSecrets
   */
  async recordChange(record: ChangeRecord): Promise<string> {
    return this.rows.add({
      actor: record.actor,
      companyCode: record.companyCode,
      kind: 'CHANGE',
      entity: record.entity,
      entityKey: record.entityKey,
      before: stripSecrets(record.before),
      after: stripSecrets(record.after),
      reason: record.reason,
    });
  }

  /**
   * Record one refused call in the security log.
   *
   * In plain words: writes who was refused which permission and why. It never throws: if writing fails the failure is logged and the refusal still reaches the caller.
   *
   * @param record The refusal
   * @returns Nothing
   * @dependencies AuditLogRepository.add, Logger.error
   */
  async recordRefusal(record: RefusalRecord): Promise<void> {
    try {
      await this.rows.add({
        actor: record.userId,
        companyCode: record.companyCode,
        kind: 'REFUSAL',
        permissionKey: record.permissionKey,
        code: record.code,
      });
    } catch (err) {
      this.logger.error(`Could not write refusal row: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * The latest changes of one record.
   *
   * In plain words: a short list for a details screen; each line is the time and the reason that was written ("Created", "Unlocked").
   *
   * @param entity Kind of record, for example User
   * @param entityKey Key of the record
   * @param limit How many at most (default 10)
   * @returns Newest first
   * @dependencies AuditLogRepository.listFor
   */
  async recentChanges(entity: string, entityKey: string, limit = 10): Promise<Array<{ at: Date; text: string }>> {
    const rows = await this.rows.listFor(entity, entityKey, limit);
    return rows.map((r) => ({ at: r.at, text: r.reason ?? 'Changed' }));
  }
}
