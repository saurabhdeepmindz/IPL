/**
 * @file    contract.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Contract of the matrix version repository. In plain words: the current version number of the saved matrix, and one atomic "check the version, write the cells, add the next version" (decision L-23).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/permission-matrix-version/contract.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { DataScope } from '@libs/database';

/** One cell to write. */
export interface CellWrite {
  roleId: string;
  permissionKey: string;
  allowed: boolean;
  scope: DataScope | null;
}

/**
 * Matrix version repository contract.
 *
 * In plain words: the matrix service depends on this class, and tests replace it with a fake.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-01, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.29 §6.6
 */
export abstract class PermissionMatrixVersionRepository {
  /** The current version number; 0 when the matrix has never been saved through the screen. */
  abstract current(): Promise<number>;

  /**
   * Writes the cells and the next version in ONE transaction, but only when `expectedVersion` is still the current one.
   * Throws StaleMatrixException when it is not (also when two saves race: the version number is unique).
   */
  abstract commit(expectedVersion: number, writes: CellWrite[], savedBy: string, reason: string): Promise<number>;
}
