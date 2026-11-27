/**
 * @file    me.service.ts
 * @module  Auth
 *
 * @description
 * Calls of the session context. In plain words: one function per contract: the profile (API-ME-01) and the choice of company and year (API-ME-02).
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
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/services/me.service.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { api } from '@/lib/api-client';
import { toApiError } from '@/lib/errors';
import { setAccessToken } from '@/lib/token';
import type { ContextInput, ContextResult, MeProfile } from '../types/me.types';

/**
 * getMe.
 *
 * In plain words: asks the AMS API who the signed-in user is, which companies and roles the user has, the financial years and the helpdesk values.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-003
 * @subtask   ST-LGN03-003-FE-01
 * @workflow  UF-03
 * @contract  API-ME-01
 * @ac        AC-US-LGN03-003-01
 * @lld       LLD-EPIC-LGN-03 v0.3 §6.1
 * @status    built
 *
 * @returns The data part of the answer
 * @throws ApiError The call failed
 */
export async function getMe(): Promise<MeProfile> {
  try {
    return (await api.get<{ data: MeProfile }>('/me')).data.data;
  } catch (e) {
    throw toApiError(e);
  }
}

/**
 * selectContext.
 *
 * In plain words: tells the AMS API which company and financial year the user works in; keeps the new access token in memory (the old one stays when the call is refused).
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-003
 * @subtask   ST-LGN03-003-FE-01
 * @workflow  UF-03
 * @contract  API-ME-02
 * @ac        AC-US-LGN03-003-03
 * @lld       LLD-EPIC-LGN-03 v0.3 §6.1
 * @status    built
 *
 * @param input The company code and the financial year
 * @returns The data part of the answer: the context, the landing page and the new token
 * @throws ApiError The choice was refused or the call failed
 */
export async function selectContext(input: ContextInput): Promise<ContextResult> {
  try {
    const result = (await api.put<{ data: ContextResult }>('/me/context', input)).data.data;
    setAccessToken(result.accessToken);
    return result;
  } catch (e) {
    throw toApiError(e);
  }
}
