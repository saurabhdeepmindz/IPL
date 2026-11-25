/**
 * @file    useReviewChanges.ts
 * @module  Permissions
 *
 * @description
 * Review hook. In plain words: sends the changes held in memory to API-PRM-02 and gives the rows and the warnings.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-016
 * @subtask        ST-ADM01-016-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/hooks/useReviewChanges.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { useMutation } from '@tanstack/react-query';
import { reviewChanges } from '../services/permissions.service';
import type { CellChange, ReviewResult } from '../types/permission.types';

/**
 * Review hook. In plain words: one mutation that previews the changes and saves nothing.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-016
 * @subtask   ST-ADM01-016-FE-01
 * @frd       FR-043.3
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-02
 * @ac        AC-US016-01, 02, 03
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.7
 * @status    built
 *
 * @dependencies reviewChanges
 *
 * @returns The mutation
 */
export function useReviewChanges() {
  return useMutation({
    mutationFn: (changes: CellChange[]): Promise<ReviewResult> => reviewChanges(changes),
  });
}
