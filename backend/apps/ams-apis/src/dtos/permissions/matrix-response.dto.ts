/**
 * @file    matrix-response.dto.ts
 * @module  RolesApi
 *
 * @description
 * Answer shapes of the matrix routes. In plain words: the matrix, a review row and the save answer as the screen reads them.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.10 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.10.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/permissions/matrix-response.dto.ts
 * @lld-synced     v0.10
 * @status         built
 */

import { DataScope } from '@libs/database';

/**
 * Matrix answers.
 *
 * In plain words: plain shapes with no logic.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-01, API-PRM-02, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.10 §6.6
 */
export class MatrixCellDto {
  allowed!: boolean;
  scope!: DataScope | null;
  locked!: boolean;
}

export class ReviewRowDto {
  role!: string;
  permission!: string;
  before!: { allowed: boolean; scope: DataScope | null };
  after!: { allowed: boolean; scope: DataScope | null };
  usersAffected!: number;
  sensitive!: boolean;
}

export class SaveResultDto {
  saved!: number;
  auditId!: string | null;
  matrixVersion!: string;
}
