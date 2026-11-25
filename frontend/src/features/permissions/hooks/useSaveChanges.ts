/**
 * @file    useSaveChanges.ts
 * @module  Permissions
 *
 * @description
 * Save hook. In plain words: saves the reviewed changes with the reason through API-PRM-03; the matrix is marked stale after a success and after a 409.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-016
 * @subtask        ST-ADM01-016-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/hooks/useSaveChanges.ts
 * @lld-synced     v0.28
 * @status         built
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/errors';
import { saveChanges } from '../services/permissions.service';
import type { SaveInput, SaveResult } from '../types/permission.types';
import { permissionsKeys } from './permissions.keys';

/**
 * Save hook. In plain words: one mutation that saves; on success and on STALE_MATRIX the matrix key is marked stale so the matrix is read again.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-016
 * @subtask   ST-ADM01-016-FE-01
 * @frd       FR-043.3
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-03
 * @ac        AC-US016-01, 02, 03
 * @lld       LLD-EPIC-ADM-01 v0.28 §6.7
 * @status    built
 *
 * @dependencies saveChanges, permissionsKeys
 *
 * @returns The mutation
 */
export function useSaveChanges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveInput): Promise<SaveResult> => saveChanges(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: permissionsKeys.all }),
    onError: (e) => {
      if (e instanceof ApiError && e.status === 409) void queryClient.invalidateQueries({ queryKey: permissionsKeys.all });
    },
  });
}
