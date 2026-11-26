/**
 * @file    index.ts
 * @module  UsersFeature
 *
 * @description
 * Public exports of the users feature. In plain words: the only file other features may import from.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013, US-ADM01-009
 * @subtask        ST-ADM01-013-FE-01, ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/index.ts
 * @lld-synced     v0.30
 * @status         built
 */
export { useUserSearch } from './hooks/useUserSearch';
export { UserListPage } from './components/UserListPage';
export { UserForm } from './components/UserForm';
export { UserDetailPage } from './components/UserDetailPage';
export { useCompanies, useDepartments, useDesignations } from './hooks/useMasters';
export { usersKeys } from './hooks/users.keys';
