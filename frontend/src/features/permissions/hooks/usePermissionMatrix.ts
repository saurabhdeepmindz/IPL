/**
 * @file    usePermissionMatrix.ts
 * @module  Permissions
 *
 * @description
 * Matrix hook. In plain words: reads the matrix once; it is not read again on window focus, so unsaved changes are not disturbed.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/hooks/usePermissionMatrix.ts
 * @lld-synced     v0.28
 * @status         built
 */

import { useQuery } from '@tanstack/react-query';
import { getMatrix } from '../services/permissions.service';
import { permissionsKeys } from './permissions.keys';

/**
 * Matrix hook. In plain words: the query of the matrix with no refetch on focus.
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
 * @dependencies getMatrix
 *
 * @returns The query
 */
export function usePermissionMatrix() {
  return useQuery({ queryKey: permissionsKeys.matrix(), queryFn: getMatrix, refetchOnWindowFocus: false });
}
