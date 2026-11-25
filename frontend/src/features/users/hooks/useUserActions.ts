/**
 * @file    useUserActions.ts
 * @module  Users
 *
 * @description
 * User actions hook. In plain words: runs Unlock, Reset password or Resend one-time password for a user and marks the user lists stale, also after a 409 or 422.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-008
 * @subtask        ST-ADM01-008-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/hooks/useUserActions.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/errors';
import { resendOneTimePassword, resetUserPassword, unlockUser } from '../services/users.service';
import type { EmailStatus, UserActionKind } from '../types/user.types';
import { usersKeys } from './users.keys';
import type { UserActionResult } from '../components/UserActionNotice';

/**
 * User actions hook. In plain words: one mutation that takes the user and the action; the lists are refreshed after success and after a 409 or 422.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-008
 * @subtask   ST-ADM01-008-FE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-06, API-USR-07, API-USR-08
 * @ac        AC-US008-01, 02, 03
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.3
 * @status    built
 *
 * @dependencies unlockUser, resetUserPassword, resendOneTimePassword
 *
 * @returns The rendered output
 */
export function useUserActions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeCode, action }: { employeeCode: string; action: UserActionKind }): Promise<{ status: 'ACTIVE' } | { emailStatus: EmailStatus }> => {
      if (action === 'unlock') return unlockUser(employeeCode);
      if (action === 'reset-password') return resetUserPassword(employeeCode);
      return resendOneTimePassword(employeeCode);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

/**
 * Action runner. In plain words: runs an action for a user and gives the result, or the message of a refused call, to the notice.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-008
 * @subtask   ST-ADM01-008-FE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-06, API-USR-07, API-USR-08
 * @ac        AC-US008-01, AC-US008-02, AC-US008-03
 * @lld       LLD-EPIC-ADM-01 v0.26 §6.3
 * @status    built
 *
 * @dependencies useUserActions
 *
 * @param onResult - called with the result for the notice
 * @returns `run(user, action)` and the busy flag
 */
export function useRunUserAction(onResult: (result: UserActionResult) => void) {
  const actions = useUserActions();
  const { mutateAsync } = actions;
  const run = useCallback(
    async (user: { employeeCode: string; email: string }, action: UserActionKind) => {
      const base = { action, employeeCode: user.employeeCode, email: user.email };
      try {
        const data = await mutateAsync({ employeeCode: user.employeeCode, action });
        onResult({ ...base, emailStatus: 'emailStatus' in data ? data.emailStatus : null });
      } catch (e) {
        onResult({ ...base, emailStatus: null, error: e instanceof ApiError ? e.message : 'The action failed. Try again.' });
      }
    },
    [mutateAsync, onResult],
  );
  return { run, busy: actions.isPending };
}
