/**
 * @file    useAssignUsers.ts
 * @module  RolesFeature
 *
 * @description
 * Assign hook. In plain words: gives the role to users and refreshes the role page.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/hooks/useAssignUsers.ts
 * @lld-synced     v0.27
 * @status         built
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignUsers } from '../services/roles.service';
import { rolesKeys } from './roles.keys';

/**
 * Assign hook. In plain words: gives the role to users and refreshes the role page and the lists.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-06
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies assignUsers
 *
 * @returns The mutation
 */
export function useAssignUsers(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { employeeCodes: string[]; companyCode: string; validFrom: string; reason: string }) => assignUsers(roleId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesKeys.all }),
  });
}
