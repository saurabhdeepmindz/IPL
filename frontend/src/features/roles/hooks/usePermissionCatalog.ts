/**
 * @file    usePermissionCatalog.ts
 * @module  RolesFeature
 *
 * @description
 * Catalog hook. In plain words: loads the permissions by module for the form.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/roles/hooks/usePermissionCatalog.ts
 * @lld-synced     v0.30
 * @status         built
 */
import { useQuery } from '@tanstack/react-query';
import { getPermissionCatalog } from '../services/roles.service';
import { rolesKeys } from './roles.keys';

/**
 * Catalog hook. In plain words: loads the permissions by module for the form (query key `rolesKeys.catalog`); fresh for 5 minutes.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-PRM-01
 * @ac        AC-US012-02
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.5
 * @status    built
 *
 * @dependencies getPermissionCatalog
 *
 * @returns The query result
 */
export function usePermissionCatalog() {
  return useQuery({ queryKey: rolesKeys.catalog(), queryFn: getPermissionCatalog, staleTime: 5 * 60 * 1000 });
}
