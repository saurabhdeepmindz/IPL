/**
 * @file    roles.keys.ts
 * @module  RolesFeature
 *
 * @description
 * Query keys of the roles feature. In plain words: one place for every key, so a save can refresh the right lists.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012, US-ADM01-013
 * @subtask        ST-ADM01-012-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/hooks/roles.keys.ts
 * @lld-synced     v0.21
 * @status         built
 */
/**
 * Query keys. In plain words: `rolesKeys.list(filters)`, `rolesKeys.detail(id, company)`, `rolesKeys.catalog()`; `rolesKeys.all` refreshes everything of the feature.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.21 §6.5
 * @status    built
 */
export const rolesKeys = {
  all: ['roles'] as const,
  list: (filters: object) => ['roles', 'list', filters] as const,
  detail: (roleId: string, company?: string) => ['roles', 'detail', roleId, company ?? 'all'] as const,
  catalog: () => ['roles', 'catalog'] as const,
};
