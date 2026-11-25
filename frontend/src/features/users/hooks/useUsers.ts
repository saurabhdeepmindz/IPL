/**
 * @file    useUsers.ts
 * @module  UsersFeature
 *
 * @description
 * User list hook. In plain words: loads the page of users for the filters (key `usersKeys.list`); keeps the previous page while the next loads.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/hooks/useUsers.ts
 * @lld-synced     v0.30
 * @status         built
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listUsers } from '../services/users.service';
import type { UserFilters } from '../types/user.types';
import { usersKeys } from './users.keys';

/**
 * User list hook. In plain words: loads the page of users for the filters (key `usersKeys.list`); keeps the previous page while the next loads.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-01
 * @ac        AC-US002-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies listUsers
 *
 * @returns The query result
 */
export function useUsers(filters: UserFilters) {
  return useQuery({ queryKey: usersKeys.list(filters), queryFn: () => listUsers(filters), placeholderData: keepPreviousData });
}
