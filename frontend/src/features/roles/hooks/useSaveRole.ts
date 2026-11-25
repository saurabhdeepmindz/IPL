/**
 * @file    useSaveRole.ts
 * @module  RolesFeature
 *
 * @description
 * Save role hook. In plain words: creates or changes a role and refreshes the lists.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/hooks/useSaveRole.ts
 * @lld-synced     v0.25
 * @status         built
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRole, updateRole } from '../services/roles.service';
import type { SaveRoleInput } from '../types/role.types';
import { rolesKeys } from './roles.keys';

/**
 * Save role hook. In plain words: creates a role, or changes it when a role id is given, then refreshes the lists.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-02, API-ROL-03
 * @ac        AC-US012-02, AC-US012-03
 * @lld       LLD-EPIC-ADM-01 v0.25 §6.5
 * @status    built
 *
 * @dependencies createRole, updateRole
 *
 * @returns The mutation
 */
export function useSaveRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, input }: { roleId?: string; input: SaveRoleInput }) => (roleId ? updateRole(roleId, input) : createRole(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesKeys.all }),
  });
}
