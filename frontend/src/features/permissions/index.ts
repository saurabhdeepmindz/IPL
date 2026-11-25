/**
 * @file    index.ts
 * @module  Permissions
 *
 * @description
 * Public entry of the permissions feature. In plain words: other features import only from here.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/index.ts
 * @lld-synced     v0.30
 * @status         built
 */
export { PermissionManagementPage } from './components/PermissionManagementPage';
export { usePermissionMatrix } from './hooks/usePermissionMatrix';
