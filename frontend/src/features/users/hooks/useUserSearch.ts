/**
 * @file    useUserSearch.ts
 * @module  UsersFeature
 *
 * @description
 * User search hook. In plain words: searches users while the Administrator types.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/hooks/useUserSearch.ts
 * @lld-synced     v0.20
 * @status         pseudo
 */

import { useQuery } from '@tanstack/react-query';

/**
 * User search hook. In plain words: waits 300 ms after typing, then calls `listUsers`.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-01
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    pseudo
 *
 * @dependencies listUsers
 *
 * @returns The query result
 */
export function useUserSearch(text: string): unknown {
  // TODO: 1. Debounce the text by 300 ms.
  // TODO: 2. useQuery enabled when the text has 2 or more characters.
  throw new Error('pseudo-code: not implemented');
}
