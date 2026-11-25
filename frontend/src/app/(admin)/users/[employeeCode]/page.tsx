/**
 * @file    page.tsx
 * @module  Users
 *
 * @description
 * Route file. In plain words: the shell with its breadcrumb around the details page.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-006
 * @subtask        ST-ADM01-006-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/app/(admin)/users/[employeeCode]/page.tsx
 * @lld-synced     v0.26
 * @status         pseudo
 */

import { AdminShell } from '@/components/layout/AdminShell';
import { UserDetailRoute } from '@/features/users/components/UserDetailRoute';

/**
 * Route file. In plain words: the shell with the breadcrumb Administration / User Management / details around the details page.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-006
 * @subtask   ST-ADM01-006-FE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-03
 * @ac        AC-US006-01
 * @lld       LLD-EPIC-ADM-01 v0.26 §6.3
 * @status    pseudo
 *
 * @dependencies AdminShell, UserDetailRoute
 *
 * @returns The rendered output
 */
export default function Page({ params }: { params: Promise<{ employeeCode: string }> }) {
  return (
    <AdminShell breadcrumbs={[{ label: 'Administration' }, { label: 'User Management', href: '/users' }, { label: 'User details' }]}>
      <UserDetailRoute params={params} />
    </AdminShell>
  );
}
