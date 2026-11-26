/**
 * @file    page.tsx
 * @module  App
 *
 * @description
 * The route /users/import. In plain words: the admin shell around the import wizard.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/app/(admin)/users/import/page.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { AdminShell } from '@/components/layout/AdminShell';
import { ImportWizard } from '@/features/users-import/components/ImportWizard';

/** Route page: the admin shell around the import wizard. */
export default function Page() {
  return (
    <AdminShell breadcrumbs={[{ label: 'Administration', href: '/dashboard' }, { label: 'User & Access Management' }, { label: 'User Management', href: '/users' }, { label: 'Import users' }]}>
      <h1 className="h3">Import users</h1>
      <p className="text-body-secondary">Add many users at once from an Excel file. Nothing is saved until the file has been checked and you confirm.</p>
      <ImportWizard />
    </AdminShell>
  );
}
