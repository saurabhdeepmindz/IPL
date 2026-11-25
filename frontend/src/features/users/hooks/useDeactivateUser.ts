/**
 * @file    useDeactivateUser.ts
 * @module  Users
 *
 * @description
 * Deactivate hook. In plain words: calls API-USR-05 and marks the user lists and the user stale afterwards.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-006
 * @subtask        ST-ADM01-006-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/hooks/useDeactivateUser.ts
 * @lld-synced     v0.25
 * @status         pseudo
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deactivateUser } from '../services/users.service';
import type { DeactivateInput } from '../types/user.types';
import { usersKeys } from './users.keys';

/**
 * Deactivate hook. In plain words: sends the reason (and the confirmation after the proposals warning); on success the lists are refreshed.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-006
 * @subtask   ST-ADM01-006-FE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-05
 * @ac        AC-US006-01, 02
 * @lld       LLD-EPIC-ADM-01 v0.25 §6.3
 * @status    pseudo
 *
 * @dependencies deactivateUser
 *
 * @returns The rendered output
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeCode, input }: { employeeCode: string; input: DeactivateInput }) => deactivateUser(employeeCode, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKeys.all }),
  });
}
