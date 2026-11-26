/**
 * @file    page.tsx
 * @module  App
 *
 * @description
 * Route `/roles/[roleId]/edit`. In plain words: thin; shows RoleForm in the shell.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/app/(admin)/roles/[roleId]/edit/page.tsx
 * @lld-synced     v0.30
 * @status         built
 */
import { Suspense } from 'react';
import { RoleEditRoute } from '@/features/roles/components/RoleEditRoute';
import { AdminShell } from '@/components/layout/AdminShell';

/**
 * Route file. In plain words: the shell with its breadcrumb around RoleForm.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.5
 * @status    built
 *
 * @dependencies AdminShell, RoleForm
 *
 * @returns The page
 */
export default function Page({ params }: { params: Promise<{ roleId: string }> }) {
  return (
    <AdminShell breadcrumbs={[{ label: 'Administration', href: '/dashboard' }, { label: 'Role Management', href: '/roles' }, { label: 'Edit role' }]}>
      <Suspense fallback={<p role="status">Loading…</p>}>
        <RoleEditRoute params={params} />
      </Suspense>
    </AdminShell>
  );
}
