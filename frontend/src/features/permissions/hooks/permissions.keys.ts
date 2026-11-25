/**
 * @file    permissions.keys.ts
 * @module  Permissions
 *
 * @description
 * Query keys of the permissions feature.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/hooks/permissions.keys.ts
 * @lld-synced     v0.30
 * @status         built
 */

/**
 * Query keys. In plain words: one key for the matrix.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-015
 * @subtask   ST-ADM01-015-FE-01
 * @frd       FR-043.1, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US015-01
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.7
 * @status    built
 *
 * @returns The keys
 */
export const permissionsKeys = {
  all: ['permissions'] as const,
  matrix: () => ['permissions', 'matrix'] as const,
};
