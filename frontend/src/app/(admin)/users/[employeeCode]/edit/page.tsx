/**
 * @file    page.tsx
 * @module  App
 *
 * @description
 * Route `/users/[employeeCode]/edit`. In plain words: thin; the shell with its breadcrumb around UserEditRoute.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/app/(admin)/users/[employeeCode]/edit/page.tsx
 * @lld-synced     v0.26
 * @status         built
 */
import { AdminShell } from '@/components/layout/AdminShell';
import { UserEditRoute } from '@/features/users/components/UserEditRoute';

/**
 * Route file. In plain words: the shell with its breadcrumb around the edit form.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @ac        AC-US004-04
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.3
 * @status    built
 *
 * @dependencies AdminShell, UserEditRoute
 *
 * @returns The page
 */
export default function Page({ params }: { params: Promise<{ employeeCode: string }> }) {
  return (
    <AdminShell breadcrumbs={[{ label: 'Administration' }, { label: 'User Management', href: '/users' }, { label: 'Edit user' }]}>
      <UserEditRoute params={params} />
    </AdminShell>
  );
}
