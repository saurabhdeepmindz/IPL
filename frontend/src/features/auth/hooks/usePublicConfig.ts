/**
 * @file    usePublicConfig.ts
 * @module  Auth
 *
 * @description
 * Query hook of the sign-in settings. In plain words: reads API-AUTH-05 once and caches it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005, US-LGN01-006, US-LGN01-007
 * @subtask        ST-LGN01-005-FE-01
 * @contract       API-AUTH-05
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/hooks/usePublicConfig.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getPublicConfig } from '../services/auth.service';
import type { PublicConfig } from '../types/auth.types';

/**
 * usePublicConfig.
 *
 * In plain words: reads the public settings
 *
 * @epic      EPIC-LGN-01
 * @story     US-LGN01-005
 * @subtask   ST-LGN01-005-FE-01
 * @workflow  UF-01
 * @contract  API-AUTH-05
 * @ac        AC-US-LGN01-005-03
 * @lld       LLD-EPIC-LGN-01 v0.4 §6.4
 * @status    built
 *
 * @returns UseQueryResult<PublicConfig>
 */
export function usePublicConfig(): UseQueryResult<PublicConfig> {
  return useQuery({ queryKey: ['auth.publicConfig'], queryFn: getPublicConfig, staleTime: 5 * 60_000 });
}
