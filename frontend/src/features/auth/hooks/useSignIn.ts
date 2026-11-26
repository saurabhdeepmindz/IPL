/**
 * @file    useSignIn.ts
 * @module  Auth
 *
 * @description
 * Mutation hook of the password sign-in. In plain words: calls API-AUTH-01, keeps the session in the store and goes to the next step.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005, US-LGN01-006
 * @subtask        ST-LGN01-005-FE-01
 * @contract       API-AUTH-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/hooks/useSignIn.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ApiError } from '@/lib/errors';
import { setAccessToken } from '@/lib/token';
import { useSessionStore } from '@/store/session.store';
import { signIn } from '../services/auth.service';
import type { SignInResponse } from '../types/auth.types';

interface SignInInput {
  employeeCode: string;
  password: string;
}

/** A return path is local when it starts with one slash and carries no scheme or backslash. */
function localPath(path: string | null): string | undefined {
  return path && /^\/(?!\/)[^\\:]*$/.test(path) ? path : undefined;
}

/**
 * useSignIn.
 *
 * In plain words: signs in
 *
 * @epic      EPIC-LGN-01
 * @story     US-LGN01-005
 * @subtask   ST-LGN01-005-FE-01
 * @workflow  UF-01
 * @contract  API-AUTH-01
 * @ac        AC-US-LGN01-005-02
 * @lld       LLD-EPIC-LGN-01 v0.5 §6.4
 * @status    built
 *
 * @returns UseMutationResult<SignInResponse, ApiError, SignInInput>
 */
export function useSignIn(): UseMutationResult<SignInResponse, ApiError, SignInInput> {
  const router = useRouter();
  const next = localPath(useSearchParams().get('next'));
  return useMutation<SignInResponse, ApiError, SignInInput>({
    mutationFn: (input) => signIn(input),
    onSuccess: (result) => {
      setAccessToken(result.accessToken);
      useSessionStore.getState().signIn({ userId: '', employeeCode: result.user.employeeCode, name: result.user.name, companyCode: '' });
      if (result.nextStep === 'CHANGE_PASSWORD') router.push('/choose-password');
      else router.push(next ? `/choose-work?next=${encodeURIComponent(next)}` : '/choose-work');
    },
  });
}
