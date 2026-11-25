/**
 * @file    page.tsx
 * @module  Permissions
 *
 * @description
 * Route file. In plain words: the shell with its breadcrumb around the Permission Management page.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/app/(admin)/permissions/page.tsx
 * @lld-synced     v0.27
 * @status         built
 */

import { AdminShell } from '@/components/layout/AdminShell';
import { PermissionManagementPage } from '@/features/permissions/components/PermissionManagementPage';

/**
 * Route file. In plain words: the shell with the breadcrumb Administration / User & Access Management / Permission Management.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-015
 * @subtask   ST-ADM01-015-FE-02
 * @frd       FR-043.1, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US015-01
 * @lld       LLD-EPIC-ADM-01 v0.27 §6.7
 * @status    built
 *
 * @dependencies AdminShell, PermissionManagementPage
 *
 * @returns The rendered output
 */
export default function Page() {
  return (
    <AdminShell breadcrumbs={[{ label: 'Administration' }, { label: 'User & Access Management' }, { label: 'Permission Management' }]}>
      <PermissionManagementPage />
    </AdminShell>
  );
}
