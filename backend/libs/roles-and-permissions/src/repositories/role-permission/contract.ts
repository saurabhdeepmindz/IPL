/**
 * @file    contract.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Contract of the role-permission repository. In plain words: reads and writes the cells of the matrix. EXTENDS the built file: `listForRole` exists; this story adds `replaceForRole` and `copyFrom`; US-ADM01-014 adds `listAll` (decision L-14).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010, US-ADM01-014
 * @subtask        ST-ADM01-010-BE-04, ST-ADM01-014-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/role-permission/contract.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { DataScope } from '@libs/database';

/** One permission as the matrix lists it. */
export interface PermissionInfo {
  key: string;
  module: string;
  label: string;
}

/** One cell of one role, for the whole-matrix read. */
export interface MatrixCell {
  roleId: string;
  key: string;
  allowed: boolean;
  scope: DataScope | null;
}

/** Everything the matrix screen needs from the cells. */
export interface MatrixData {
  permissions: PermissionInfo[];
  cells: MatrixCell[];
}

/** One cell of the matrix. */
export interface PermissionCell {
  key: string;
  allowed: boolean;
  scope: DataScope | null;
}

/**
 * Role-permission repository contract.
 *
 * In plain words: the cells of a role; the roles service and the matrix service depend on this class.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-02, API-ROL-03, API-PRM-01, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.24 §6.4
 */
export abstract class RolePermissionRepository {
  /** The cells of one role (built in ST-ADM01-000-BE-08). */
  abstract listForRole(roleId: string): Promise<PermissionCell[]>;

  /** Replaces the cells of a role with the given ones (cells not given become not allowed). */
  abstract replaceForRole(roleId: string, cells: PermissionCell[]): Promise<void>;

  /** Copies every cell of one role to another role. */
  abstract copyFrom(sourceRoleId: string, targetRoleId: string): Promise<void>;

  /** Every permission and every cell of every role (US-ADM01-014; replaces the planned `listAll`, decision L-23). */
  abstract readMatrix(): Promise<MatrixData>;
}
