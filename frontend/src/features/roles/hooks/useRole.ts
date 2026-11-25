/**
 * @file    useRole.ts
 * @module  RolesFeature
 *
 * @description
 * Role hook. In plain words: loads one role with its holders.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/hooks/useRole.ts
 * @lld-synced     v0.20
 * @status         pseudo
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesKeys } from './roles.keys';

/**
 * Role hook. In plain words: loads one role with its holders.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    pseudo
 *
 * @dependencies TanStack Query, roles.service
 *
 * @returns The query or mutation result
 */
export function useRole(): unknown {
  // TODO: 1. useQuery with `rolesKeys.detail` and `getRole`.
  throw new Error('pseudo-code: not implemented');
}
