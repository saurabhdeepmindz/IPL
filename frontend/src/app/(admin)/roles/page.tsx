/**
 * @file    page.tsx
 * @module  App
 *
 * @description
 * Route `/roles`. In plain words: thin; shows RoleListPage in the shell.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/app/(admin)/roles/page.tsx
 * @lld-synced     v0.24
 * @status         built
 */
import { RoleListPage } from '@/features/roles';
import { AdminShell } from '@/components/layout/AdminShell';

/**
 * Route file. In plain words: the shell with its breadcrumb around RoleListPage.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.5
 * @status    built
 *
 * @dependencies AdminShell, RoleListPage
 *
 * @returns The page
 */
export default function Page() {
  return (
    <AdminShell breadcrumbs={[{ label: 'Administration' }, { label: 'Role Management' }]}>
      <RoleListPage />
    </AdminShell>
  );
}
