/**
 * @file    matrix-change-analyzer.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Works out what a list of cell changes would do. In plain words: for each change, the cell before and after, how many users it touches, whether the right is sensitive, and whether a cell is locked. It saves nothing.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.22 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.22.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/services/matrix-change-analyzer.ts
 * @lld-synced     v0.22
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { DataScope } from '@libs/database';
import { FieldError, ValidationFailedException } from '@libs/common';
import { ADMINISTRATOR_ROLE_CODE, PROTECTED_RIGHTS } from '../constants/protected-rights';
import { SCOPE_RANK, SENSITIVE_RIGHTS } from '../constants/sensitive-rights';
import { LockedCellException } from '../errors/locked-cell.exception';
import { RoleRepository } from '../repositories/role';
import { RolePermissionRepository } from '../repositories/role-permission';

/** One requested change. */
export interface CellChange {
  roleId: string;
  permissionKey: string;
  allowed?: boolean;
  scope?: DataScope | null;
}

/** A cell as the screen shows it. */
export interface CellState {
  allowed: boolean;
  scope: DataScope | null;
}

/** What one change would do. */
export interface AnalyzedChange {
  roleId: string;
  roleName: string;
  permissionKey: string;
  permissionLabel: string;
  before: CellState;
  after: CellState;
  usersAffected: number;
  sensitive: boolean;
  changed: boolean;
}

/**
 * Matrix change analyzer.
 *
 * In plain words: shared by the preview (review) and the save, so both give the same answer.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-02, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.22 §6.6
 */
const NOT_ALLOWED: CellState = { allowed: false, scope: null };

/** No scope means the right is not limited, so it counts as the widest. */
const rank = (scope: DataScope | null): number => (scope === null ? 4 : (SCOPE_RANK[scope] ?? 0));

@Injectable()
export class MatrixChangeAnalyzer {
  constructor(
    private readonly roles: RoleRepository,
    private readonly cells: RolePermissionRepository,
  ) {}

  /**
   * Analyzes a list of changes.
   *
   * In plain words: looks up the roles and the cells, checks every change, and returns what each would do. Nothing is saved.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-02, API-PRM-03
 * @ac        AC-US014-02, AC-US014-03, AC-US014-04, AC-US014-05
 * @lld       LLD-EPIC-ADM-01 v0.22 §6.6
 * @status    built
   *
   * @dependencies RoleRepository.findById, countHolders, RolePermissionRepository.readMatrix, MatrixChangeAnalyzer.checkLocked, MatrixChangeAnalyzer.isWider
   *
   * @param changes - the requested changes
   * @returns One AnalyzedChange per change
   * @throws ValidationFailedException - an unknown role or permission, or an invalid scope (HTTP 422)
   * @throws LockedCellException - a locked cell, or an administration right for another role (HTTP 403)
   */
  async analyze(changes: CellChange[]): Promise<AnalyzedChange[]> {
    const matrix = await this.cells.readMatrix();
    const labels = new Map(matrix.permissions.map((p) => [p.key, p.label]));
    const cellOf = new Map(matrix.cells.map((c) => [`${c.roleId}|${c.key}`, { allowed: c.allowed, scope: c.scope }]));
    const errors: FieldError[] = [];
    const out: AnalyzedChange[] = [];
    for (const [i, c] of changes.entries()) {
      const role = await this.roles.findById(c.roleId);
      if (!role) errors.push({ field: `changes.${i}.roleId`, message: 'Unknown role' });
      if (!labels.has(c.permissionKey)) errors.push({ field: `changes.${i}.permissionKey`, message: 'Unknown permission' });
      if (c.scope && !(c.scope in SCOPE_RANK)) errors.push({ field: `changes.${i}.scope`, message: 'Use OWN, DEPARTMENT or COMPANY' });
      if (!role || !labels.has(c.permissionKey) || (c.scope && !(c.scope in SCOPE_RANK))) continue;
      const before = cellOf.get(`${c.roleId}|${c.permissionKey}`) ?? NOT_ALLOWED;
      const after: CellState = { allowed: c.allowed ?? before.allowed, scope: c.scope !== undefined ? c.scope : before.scope };
      this.checkLocked(role.code, c.permissionKey, after);
      const changed = after.allowed !== before.allowed || (after.allowed && after.scope !== before.scope);
      const sensitive = SENSITIVE_RIGHTS.includes(c.permissionKey) && role.code !== ADMINISTRATOR_ROLE_CODE && this.isWider(before, after);
      out.push({ roleId: c.roleId, roleName: role.name, permissionKey: c.permissionKey, permissionLabel: labels.get(c.permissionKey) as string, before, after, usersAffected: await this.roles.countHolders(c.roleId), sensitive, changed });
    }
    if (errors.length > 0) throw new ValidationFailedException(errors);
    return out;
  }

  /**
   * Checks the locked cells.
   *
   * In plain words: the Administrator role keeps its protected rights, and no other role may be given them (decision L-20).
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-02, API-PRM-03
 * @ac        AC-US014-05
 * @lld       LLD-EPIC-ADM-01 v0.22 §6.6
 * @status    built
   *
   * @dependencies ADMINISTRATOR_ROLE_CODE, PROTECTED_RIGHTS
   *
   * @param roleCode - the role code
   * @param permissionKey - the right
   * @param after - the cell after the change
   * @returns Nothing
   * @throws LockedCellException - the change is not allowed (HTTP 403)
   */
  private checkLocked(roleCode: string, permissionKey: string, after: CellState): void {
    if (!PROTECTED_RIGHTS.includes(permissionKey)) return;
    if (roleCode === ADMINISTRATOR_ROLE_CODE && !after.allowed) throw new LockedCellException('The Administrator role keeps this right');
    if (roleCode !== ADMINISTRATOR_ROLE_CODE && after.allowed) throw new LockedCellException('This administration right cannot be given to another role');
  }

  /**
   * Tells whether a right becomes wider.
   *
   * In plain words: not allowed to allowed, or a scope that reaches further (Own, then Department, then Company).
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-02, API-PRM-03
 * @ac        AC-US014-04
 * @lld       LLD-EPIC-ADM-01 v0.22 §6.6
 * @status    built
   *
   * @dependencies SCOPE_RANK
   *
   * @param before - the cell before
   * @param after - the cell after
   * @returns True when the right is wider
   */
  private isWider(before: CellState, after: CellState): boolean {
    if (!after.allowed) return false;
    return !before.allowed || rank(after.scope) > rank(before.scope);
  }
}
