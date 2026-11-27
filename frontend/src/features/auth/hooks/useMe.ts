/**
 * @file    useMe.ts
 * @module  Auth
 *
 * @description
 * Hooks of the session context. In plain words: `useMe` reads the profile; `useSelectContext` saves the choice of company and year, stores it in the session store, clears the cached data of the old company and opens the landing page.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-003, US-LGN03-004, US-LGN03-005
 * @subtask        ST-LGN03-003-FE-01
 * @contract       API-ME-01, API-ME-02
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/hooks/useMe.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { ApiError } from '@/lib/errors';
import { useSessionStore } from '@/store/session.store';
import { getMe, selectContext } from '../services/me.service';
import type { ContextInput, ContextResult, MeProfile } from '../types/me.types';

/**
 * useMe.
 *
 * In plain words: reads the profile (companies, roles, years, helpdesk) once and keeps it until the user changes company.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-003
 * @subtask   ST-LGN03-003-FE-01
 * @contract  API-ME-01
 * @ac        AC-US-LGN03-003-01
 * @lld       LLD-EPIC-LGN-03 v0.3 §6.1
 * @status    built
 *
 * @returns The query result with the profile
 */
export function useMe(): UseQueryResult<MeProfile> {
  return useQuery<MeProfile>({ queryKey: ['me'], queryFn: getMe, staleTime: 60_000 });
}

/**
 * useSelectContext.
 *
 * In plain words: saves the choice; on success the company, year and landing page go into the session store, every cached answer of the old company is dropped, and the browser opens the landing page.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-003
 * @subtask   ST-LGN03-003-FE-01
 * @contract  API-ME-02
 * @ac        AC-US-LGN03-003-03
 * @lld       LLD-EPIC-LGN-03 v0.3 §6.1
 * @status    built
 *
 * @returns The mutation: call `mutate({ companyCode, financialYear })`
 */
export function useSelectContext(): UseMutationResult<ContextResult, ApiError, ContextInput> {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setContext = useSessionStore((s) => s.setContext);
  return useMutation<ContextResult, ApiError, ContextInput>({
    mutationFn: selectContext,
    onSuccess: async (result) => {
      setContext(result.context, result.landing);
      await queryClient.invalidateQueries();
      router.push(result.landing.route);
    },
  });
}
