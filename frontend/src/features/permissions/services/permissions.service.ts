/**
 * @file    permissions.service.ts
 * @module  Permissions
 *
 * @description
 * Permission matrix calls. In plain words: one function per contract; this story has the read.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/services/permissions.service.ts
 * @lld-synced     v0.28
 * @status         built
 */

import { api } from '@/lib/api-client';
import type { CellChange, PermissionMatrixData, ReviewResult, SaveInput, SaveResult } from '../types/permission.types';

/**
 * Read the matrix. In plain words: returns the roles, the permission groups and every cell with the matrix version.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-015
 * @subtask   ST-ADM01-015-FE-01
 * @frd       FR-043.1, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US015-01
 * @lld       LLD-EPIC-ADM-01 v0.28 §6.7
 * @status    built
 *
 * @dependencies api.get
 *
 * @returns The matrix
 */
export async function getMatrix(): Promise<PermissionMatrixData> {
  const res = await api.get<{ data: PermissionMatrixData }>('/roles/permissions/matrix');
  return res.data.data;
}

/**
 * Review changes. In plain words: sends the changes held in memory and gets, for each, the cell before and after, the users affected and whether the right is sensitive; nothing is saved.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-016
 * @subtask   ST-ADM01-016-FE-01
 * @frd       FR-043.3
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-02
 * @ac        AC-US016-01, AC-US016-02
 * @lld       LLD-EPIC-ADM-01 v0.28 §6.7
 * @status    built
 *
 * @dependencies api.post
 *
 * @param changes - the changes held in memory (1 to 200)
 * @returns The rows and the warnings
 */
export async function reviewChanges(changes: CellChange[]): Promise<ReviewResult> {
  const res = await api.post<{ data: ReviewResult }>('/roles/permissions/review', { changes });
  return res.data.data;
}

/**
 * Save changes. In plain words: saves the reviewed changes with the matrix version, the reason, the approval reference and the confirmation of sensitive rights.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-016
 * @subtask   ST-ADM01-016-FE-01
 * @frd       FR-043.3
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-03
 * @ac        AC-US016-01, AC-US016-02, AC-US016-03
 * @lld       LLD-EPIC-ADM-01 v0.28 §6.7
 * @status    built
 *
 * @dependencies api.put
 *
 * @param input - the changes, the matrix version, the reason, the reference and the confirmation
 * @returns The number saved, the audit id and the new matrix version
 */
export async function saveChanges(input: SaveInput): Promise<SaveResult> {
  const res = await api.put<{ data: SaveResult }>('/roles/permissions', input);
  return res.data.data;
}
