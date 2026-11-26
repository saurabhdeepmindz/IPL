/**
 * @file    useUser.ts
 * @module  UsersFeature
 *
 * @description
 * User hook. In plain words: loads one user for the edit form.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/hooks/useUser.ts
 * @lld-synced     v0.30
 * @status         built
 */
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../services/users.service';
import { usersKeys } from './users.keys';

/**
 * User hook. In plain words: loads one user for the edit form; it waits while no code is given.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-03
 * @ac        AC-US004-04
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies getUser
 *
 * @returns The query result
 */
export function useUser(employeeCode: string | undefined) {
  return useQuery({ queryKey: usersKeys.detail(employeeCode ?? ''), queryFn: () => getUser(employeeCode as string), enabled: Boolean(employeeCode) });
}
