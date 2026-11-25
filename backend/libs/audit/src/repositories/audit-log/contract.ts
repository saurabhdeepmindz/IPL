/**
 * @file    contract.ts
 * @module  AuditModule
 *
 * @description
 * Contract of the audit-log repository. In plain words: the one way rows are added to the audit log.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-03
 */

/** A row to write to the audit log. */
export interface AuditRow {
  actor: string;
  companyCode?: string | null;
  kind: 'CHANGE' | 'REFUSAL';
  entity?: string | null;
  entityKey?: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  permissionKey?: string | null;
  code?: string | null;
}

/** One stored change row as the readers see it. */
export interface AuditEntry {
  at: Date;
  actor: string;
  reason: string | null;
}

/**
 * Write access to the audit log.
 *
 * In plain words: add one row. Rows are never changed or deleted.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export abstract class AuditLogRepository {
  /**
   * Add one row.
   *
   * In plain words: stores the row exactly as given (the service has already removed secrets).
   *
   * @param row The row to store
   * @returns Nothing
   * @dependencies none
   */
  abstract add(row: AuditRow): Promise<string>;

  /**
   * The latest change rows of one record.
   *
   * In plain words: newest first, only rows of kind CHANGE for this entity and key, at most `limit` rows.
   *
   * @param entity Kind of record, for example User
   * @param entityKey Key of the record
   * @param limit How many rows at most
   * @returns The rows, newest first
   * @dependencies none
   */
  abstract listFor(entity: string, entityKey: string, limit: number): Promise<AuditEntry[]>;
}
