/**
 * @file    useRoles.ts
 * @module  RolesFeature
 *
 * @description
 * Roles list hook. In plain words: loads the roles for the filters.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/hooks/useRoles.ts
 * @lld-synced     v0.24
 * @status         built
 */
import { useQuery } from '@tanstack/react-query';
import { listRoles } from '../services/roles.service';
import { rolesKeys } from './roles.keys';

/**
 * Roles list hook. In plain words: loads the roles for the filters (query key `rolesKeys.list`).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-01
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.5
 * @status    built
 *
 * @dependencies listRoles
 *
 * @returns The query result
 */
export function useRoles(filters: { q?: string; type?: string; status?: string }) {
  return useQuery({ queryKey: rolesKeys.list(filters), queryFn: () => listRoles(filters) });
}
