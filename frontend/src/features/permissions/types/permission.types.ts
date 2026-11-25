/**
 * @file    permission.types.ts
 * @module  Permissions
 *
 * @description
 * Types of the permission matrix. In plain words: the answer of API-PRM-01 (roles, groups, cells with locked) and the change of one cell.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/types/permission.types.ts
 * @lld-synced     v0.27
 * @status         built
 */

/** The data scope of a permission. */
export type DataScope = 'OWN' | 'DEPARTMENT' | 'COMPANY';

/** One cell of the matrix: one role and one permission. */
export interface MatrixCell {
  allowed: boolean;
  /** The data scope; null for a yes-or-no permission */
  scope: DataScope | null;
  /** A protected right: it cannot be changed */
  locked: boolean;
}

/** One role column. */
export interface MatrixRole {
  roleId: string;
  name: string;
  userCount: number;
}

/** One permission row with one cell per role id. */
export interface MatrixPermission {
  key: string;
  label: string;
  hint: string;
  cells: Record<string, MatrixCell>;
}

/** The permissions of one module. */
export interface MatrixGroup {
  module: string;
  permissions: MatrixPermission[];
}

/** The answer of API-PRM-01. */
export interface PermissionMatrixData {
  matrixVersion: string;
  roles: MatrixRole[];
  groups: MatrixGroup[];
}

/** The value of a cell that can change. */
export interface CellValue {
  allowed: boolean;
  scope: DataScope | null;
}

/** One change held in memory: one role, one permission and the new value. */
export interface CellChange extends CellValue {
  roleId: string;
  permissionKey: string;
}
