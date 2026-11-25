/**
 * @file    index.ts
 * @module  RolesFeature
 *
 * @description
 * Public exports of the roles feature. In plain words: the only file other features and the route files import from.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012, US-ADM01-013
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/index.ts
 * @lld-synced     v0.23
 * @status         built
 */
export { RoleListPage } from './components/RoleListPage';
export { RoleForm } from './components/RoleForm';
export { RoleDetailPage } from './components/RoleDetailPage';
export { useRoles } from './hooks/useRoles';
