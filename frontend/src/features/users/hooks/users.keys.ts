/**
 * @file    users.keys.ts
 * @module  UsersFeature
 *
 * @description
 * Query keys of the users feature. In plain words: one place for every key.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002, US-ADM01-004
 * @subtask        ST-ADM01-002-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/hooks/users.keys.ts
 * @lld-synced     v0.27
 * @status         built
 */
/**
 * Query keys. In plain words: `usersKeys.list(filters)`, `usersKeys.detail(code)`, `usersKeys.masters(name)`; `usersKeys.all` refreshes everything of the feature.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US002-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 */
export const usersKeys = {
  all: ['users'] as const,
  list: (filters: object) => ['users', 'list', filters] as const,
  detail: (employeeCode: string) => ['users', 'detail', employeeCode] as const,
  masters: (name: string) => ['users', 'masters', name] as const,
};
