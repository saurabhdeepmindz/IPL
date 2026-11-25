/**
 * @file    page.tsx
 * @module  App
 *
 * @description
 * Route `/users`. In plain words: thin; the shell with its breadcrumb around UserListPage.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/app/(admin)/users/page.tsx
 * @lld-synced     v0.27
 * @status         built
 */
import { AdminShell } from '@/components/layout/AdminShell';
import { UserListPage } from '@/features/users/components/UserListPage';

/**
 * Route file. In plain words: the shell with its breadcrumb around the user list.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US002-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies AdminShell, UserListPage
 *
 * @returns The page
 */
export default function Page() {
  return (
    <AdminShell breadcrumbs={[{ label: 'Administration' }, { label: 'User Management' }]}>
      <UserListPage />
    </AdminShell>
  );
}
