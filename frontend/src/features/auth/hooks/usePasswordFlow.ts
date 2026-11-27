/**
 * @file    usePasswordFlow.ts
 * @module  Auth
 *
 * @description
 * Hooks of the password flow. In plain words: mutations and the link query on top of the service calls.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-006, US-LGN02-007, US-LGN02-008
 * @subtask        ST-LGN02-006-FE-01
 * @contract       API-PWD-01, API-PWD-02, API-PWD-03, API-PWD-04
 * @lld            LLD-EPIC-LGN-02 v0.2 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/hooks/usePasswordFlow.ts
 * @lld-synced     v0.2
 * @status         built
 */

import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { ApiError } from '@/lib/errors';
import { forgotPassword } from '../services/password.service';
import type { ForgotAnswer, ForgotInput, LinkCheck, SetPasswordInput, TempInput } from '../types/password.types';

/**
 * useForgotPassword.
 *
 * In plain words: asks for a reset link
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-006
 * @subtask   ST-LGN02-006-FE-01
 * @workflow  UF-02
 * @contract  API-PWD-01
 * @ac        AC-US-LGN02-006-02, AC-US-LGN02-006-03
 * @lld       LLD-EPIC-LGN-02 v0.2 §6.2
 * @status    built
 *
 * @returns UseMutationResult<ForgotAnswer, ApiError, ForgotInput>
 */
export function useForgotPassword(): UseMutationResult<ForgotAnswer, ApiError, ForgotInput> {
  return useMutation<ForgotAnswer, ApiError, ForgotInput>({ mutationFn: (input) => forgotPassword(input) });
}

/**
 * useResetLink.
 *
 * In plain words: checks the link
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-01
 * @workflow  UF-02
 * @contract  API-PWD-02
 * @ac        AC-US-LGN02-007-03
 * @lld       LLD-EPIC-LGN-02 v0.2 §6.2
 * @status    pseudo
 *
 * @returns UseQueryResult<LinkCheck>
 */
export function useResetLink(_token: string): UseQueryResult<LinkCheck> {
  // TODO: 1. Run a query with checkResetLink; do not retry on 410.
  throw new Error('Not implemented (pseudo-code)');
}

/**
 * useSetPassword.
 *
 * In plain words: sets the password
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-01
 * @workflow  UF-02
 * @contract  API-PWD-03
 * @ac        AC-US-LGN02-007-04
 * @lld       LLD-EPIC-LGN-02 v0.2 §6.2
 * @status    pseudo
 *
 * @returns UseMutationResult<void, ApiError, SetPasswordInput>
 */
export function useSetPassword(): UseMutationResult<void, ApiError, SetPasswordInput> {
  // TODO: 1. Run a mutation with resetPassword.
  throw new Error('Not implemented (pseudo-code)');
}

/**
 * useChangeTemporaryPassword.
 *
 * In plain words: changes the temporary password
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-008
 * @subtask   ST-LGN02-008-FE-01
 * @workflow  UF-02
 * @contract  API-PWD-04
 * @ac        AC-US-LGN02-008-02
 * @lld       LLD-EPIC-LGN-02 v0.2 §6.2
 * @status    pseudo
 *
 * @returns UseMutationResult<{ nextStep: string }, ApiError, TempInput>
 */
export function useChangeTemporaryPassword(): UseMutationResult<{ nextStep: string }, ApiError, TempInput> {
  // TODO: 1. Run a mutation with changeTemporaryPassword.
  // TODO: 2. On success go to `/choose-work`.
  throw new Error('Not implemented (pseudo-code)');
}
