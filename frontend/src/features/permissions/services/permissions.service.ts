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
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/services/permissions.service.ts
 * @lld-synced     v0.27
 * @status         built
 */

import { api } from '@/lib/api-client';
import type { PermissionMatrixData } from '../types/permission.types';

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
 * @lld       LLD-EPIC-ADM-01 v0.27 §6.7
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
