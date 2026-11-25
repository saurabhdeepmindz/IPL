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
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/hooks/useRole.ts
 * @lld-synced     v0.21
 * @status         built
 */
import { useQuery } from '@tanstack/react-query';
import { getRole } from '../services/roles.service';
import { rolesKeys } from './roles.keys';

/**
 * Role hook. In plain words: loads one role with its holders (query key `rolesKeys.detail`).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-05
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies getRole
 *
 * @returns The query result
 */
export function useRole(roleId: string, companyCode?: string) {
  return useQuery({ queryKey: rolesKeys.detail(roleId, companyCode), queryFn: () => getRole(roleId, companyCode) });
}
