/**
 * @file    useMasters.ts
 * @module  UsersFeature
 *
 * @description
 * Masters hooks. In plain words: `useDepartments`, `useDesignations` and `useCompanies`, each fresh for 10 minutes.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/hooks/useMasters.ts
 * @lld-synced     v0.26
 * @status         built
 */
import { useQuery } from '@tanstack/react-query';
import { getCompanies, getDepartments, getDesignations } from '../services/masters.service';
import { usersKeys } from './users.keys';

const TEN_MINUTES = 10 * 60 * 1000;

/**
 * Departments hook. In plain words: the departments, fresh for 10 minutes.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-MST-01
 * @ac        AC-US002-02
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies getDepartments
 *
 * @returns The query result
 */
export function useDepartments() {
  return useQuery({ queryKey: usersKeys.masters('departments'), queryFn: getDepartments, staleTime: TEN_MINUTES });
}

/**
 * Designations hook. In plain words: the designations with the highest one marked, fresh for 10 minutes.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-MST-02
 * @ac        AC-US004-05
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies getDesignations
 *
 * @returns The query result
 */
export function useDesignations() {
  return useQuery({ queryKey: usersKeys.masters('designations'), queryFn: getDesignations, staleTime: TEN_MINUTES });
}

/**
 * Companies hook. In plain words: the active companies and `canViewAll`, fresh for 10 minutes.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-MST-03
 * @ac        AC-US002-02
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies getCompanies
 *
 * @returns The query result
 */
export function useCompanies() {
  return useQuery({ queryKey: usersKeys.masters('companies'), queryFn: getCompanies, staleTime: TEN_MINUTES });
}
