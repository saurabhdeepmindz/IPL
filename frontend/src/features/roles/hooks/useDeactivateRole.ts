/**
 * @file    useDeactivateRole.ts
 * @module  RolesFeature
 *
 * @description
 * Deactivate hook. In plain words: deactivates a role and refreshes the lists.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/hooks/useDeactivateRole.ts
 * @lld-synced     v0.30
 * @status         built
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deactivateRole } from '../services/roles.service';
import { rolesKeys } from './roles.keys';

/**
 * Deactivate hook. In plain words: deactivates a role and refreshes the lists.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-04
 * @ac        AC-US012-05
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.5
 * @status    built
 *
 * @dependencies deactivateRole
 *
 * @returns The mutation
 */
export function useDeactivateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, reason }: { roleId: string; reason: string }) => deactivateRole(roleId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesKeys.all }),
  });
}
