/**
 * @file    permission-matrix.service.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Permission matrix rules. In plain words: serves the matrix, previews a change, and saves it with a reason, a version check and the confirmation of sensitive rights.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.13 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.13.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/services/permission-matrix.service.ts
 * @lld-synced     v0.13
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { AuditService } from '@libs/audit';
import { PermissionCacheInvalidator } from '../ports/permission-cache-invalidator';
import { RoleRepository } from '../repositories/role';
import { RolePermissionRepository } from '../repositories/role-permission';
import { PermissionMatrixVersionRepository } from '../repositories/permission-matrix-version';
import { SensitiveConfirmRequiredException } from '../errors/sensitive-confirm-required.exception';
import { StaleMatrixException } from '../errors/stale-matrix.exception';
import { PROTECTED_RIGHTS } from '../constants/protected-rights';
import { RoleRecord } from '../repositories/role';
import { MatrixData } from '../repositories/role-permission';
import { AnalyzedChange, CellChange, CellState, MatrixChangeAnalyzer } from './matrix-change-analyzer';

/** What the matrix screen reads. */
export interface MatrixView {
  matrixVersion: string;
  roles: Array<{ roleId: string; name: string; userCount: number }>;
  groups: Array<{ module: string; permissions: Array<{ key: string; label: string; hint: string; cells: Record<string, CellState & { locked: boolean }> }> }>;
}

/** The input of a save. */
export interface SaveInput {
  changes: CellChange[];
  matrixVersion: string;
  reason: string;
  approvalReference?: string;
  confirmSensitive?: boolean;
}

/**
 * Permission matrix service.
 *
 * In plain words: the rules of the matrix; the controller only passes the request in and the answer out.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-01, API-PRM-02, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.13 §6.6
 */
/** A cell is locked when it is a protected right: the Administrator role keeps it and no other role can be given it (decision L-20). */
const isLocked = (key: string): boolean => PROTECTED_RIGHTS.includes(key);

@Injectable()
export class PermissionMatrixService {
  constructor(
    private readonly roles: RoleRepository,
    private readonly cells: RolePermissionRepository,
    private readonly versions: PermissionMatrixVersionRepository,
    private readonly analyzer: MatrixChangeAnalyzer,
    private readonly cache: PermissionCacheInvalidator,
    private readonly audit: AuditService,
  ) {}

  /** Groups the wanted permissions by module and builds the cells of every role. */
  private group(wanted: MatrixData['permissions'], data: MatrixData, roles: RoleRecord[]): MatrixView['groups'] {
    const cellOf = new Map(data.cells.map((c) => [`${c.roleId}|${c.key}`, { allowed: c.allowed, scope: c.scope }]));
    const byModule = new Map<string, MatrixView['groups'][number]['permissions']>();
    for (const p of wanted) {
      const cells: Record<string, CellState & { locked: boolean }> = {};
      for (const r of roles) cells[r.id] = { ...(cellOf.get(`${r.id}|${p.key}`) ?? { allowed: false, scope: null }), locked: isLocked(p.key) };
      byModule.set(p.module, [...(byModule.get(p.module) ?? []), { key: p.key, label: p.label, hint: p.key, cells }]);
    }
    return [...byModule.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([module, permissions]) => ({ module, permissions }));
  }

  /**
   * Reads the matrix.
   *
   * In plain words: the Active and Draft roles across, the permissions down grouped by module, each cell with allowed, scope and locked, and the version.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US014-01
 * @lld       LLD-EPIC-ADM-01 v0.13 §6.6
 * @status    built
   *
   * @dependencies RoleRepository.findPage, RolePermissionRepository.readMatrix, PermissionMatrixVersionRepository.current
   *
   * @param filter - module and a text to find in the permission label or key (both optional)
   * @returns The matrix view
   */
  async getMatrix(filter: { module?: string; q?: string }): Promise<MatrixView> {
    const roles = (await this.roles.findPage({})).filter((r) => r.status !== 'INACTIVE');
    const data = await this.cells.readMatrix();
    const text = filter.q?.toLowerCase();
    const wanted = data.permissions.filter((p) => (!filter.module || p.module === filter.module) && (!text || p.label.toLowerCase().includes(text) || p.key.toLowerCase().includes(text)));
    return { matrixVersion: String(await this.versions.current()), roles: roles.map((r) => ({ roleId: r.id, name: r.name, userCount: r.userCount })), groups: this.group(wanted, data, roles) };
  }

  /**
   * Previews a change.
   *
   * In plain words: returns before, after, users affected and the sensitive flag for each change, and saves nothing.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-02
 * @ac        AC-US014-03, AC-US014-05
 * @lld       LLD-EPIC-ADM-01 v0.13 §6.6
 * @status    built
   *
   * @dependencies MatrixChangeAnalyzer.analyze
   *
   * @param changes - the requested changes
   * @returns The rows and the warnings
   * @throws LockedCellException (HTTP 403)
   * @throws ValidationFailedException (HTTP 422)
   */
  async review(changes: CellChange[]): Promise<{ rows: AnalyzedChange[]; warnings: string[] }> {
    const rows = (await this.analyzer.analyze(changes)).filter((r) => r.changed);
    const warnings = rows.filter((r) => r.sensitive).map((r) => `${r.permissionLabel} is a sensitive right and is being given to ${r.roleName}`);
    return { rows, warnings };
  }

  /**
   * Saves a change.
   *
   * In plain words: checks the version and the confirmation, writes the cells and the next version in one transaction, clears the permission cache and records the save in the audit trail.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-03
 * @ac        AC-US014-03, AC-US014-04, AC-US014-05
 * @lld       LLD-EPIC-ADM-01 v0.13 §6.6
 * @status    built
   *
   * @dependencies MatrixChangeAnalyzer.analyze, PermissionMatrixVersionRepository.current, commit, PermissionCacheInvalidator.clearAll, AuditService.recordChange
   *
   * @param input - the changes, the version the caller saw, the reason, the approval reference and the confirmation
   * @param actor - user key of the caller (audit)
   * @param savedBy - employee code of the caller (version row)
   * @returns `saved`, `auditId` and the new `matrixVersion`
   * @throws StaleMatrixException - the version moved on (HTTP 409)
   * @throws SensitiveConfirmRequiredException - a sensitive right is widened and `confirmSensitive` is not true (HTTP 422)
   * @throws LockedCellException (HTTP 403)
   * @throws ValidationFailedException (HTTP 422)
   */
  async save(input: SaveInput, actor: string, savedBy: string): Promise<{ saved: number; auditId: string | null; matrixVersion: string }> {
    const analyzed = await this.analyzer.analyze(input.changes);
    const expected = Number(input.matrixVersion);
    if (expected !== (await this.versions.current())) throw new StaleMatrixException();
    if (analyzed.some((r) => r.sensitive) && !input.confirmSensitive) throw new SensitiveConfirmRequiredException();
    const rows = analyzed.filter((r) => r.changed);
    if (rows.length === 0) return { saved: 0, auditId: null, matrixVersion: String(expected) };
    const writes = rows.map((r) => ({ roleId: r.roleId, permissionKey: r.permissionKey, allowed: r.after.allowed, scope: r.after.scope }));
    const version = await this.versions.commit(expected, writes, savedBy, input.reason);
    await this.cache.clearAll();
    const line = (r: AnalyzedChange, cellState: CellState) => ({ role: r.roleName, permission: r.permissionKey, ...cellState });
    const auditId = await this.audit.recordChange({
      actor, entity: 'PermissionMatrix', entityKey: String(version), reason: input.reason,
      before: { changes: rows.map((r) => line(r, r.before)) },
      after: { changes: rows.map((r) => line(r, r.after)), approvalReference: input.approvalReference ?? null },
    });
    return { saved: rows.length, auditId, matrixVersion: String(version) };
  }
}
