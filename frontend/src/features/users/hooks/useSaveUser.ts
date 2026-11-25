/**
 * @file    useSaveUser.ts
 * @module  UsersFeature
 *
 * @description
 * Save user hook. In plain words: creates a user (with one Idempotency-Key per form) or changes one, then refreshes the lists.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/hooks/useSaveUser.ts
 * @lld-synced     v0.26
 * @status         built
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser } from '../services/users.service';
import type { CreateUserResult, UserDetails, UserFormData } from '../types/user.types';
import { usersKeys } from './users.keys';

/**
 * Save user hook. In plain words: creates a user (with the form's Idempotency-Key) or, when a code is given, changes that user; then the user lists are marked stale.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-02, API-USR-04
 * @ac        AC-US004-01, AC-US004-04
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies createUser, updateUser
 *
 * @returns The mutation
 */
export function useSaveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeCode, input, idempotencyKey }: { employeeCode?: string; input: UserFormData; idempotencyKey: string }): Promise<CreateUserResult | UserDetails> =>
      employeeCode ? updateUser(employeeCode, input) : createUser(input, idempotencyKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKeys.all }),
  });
}
