/**
 * @file    RoleDetailPage.tsx
 * @module  RolesFeature
 *
 * @description
 * The role page. In plain words: the role, its users by company with the assignment date, the company filter, "what this role allows" and the Assign users button.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleDetailPage.tsx
 * @lld-synced     v0.23
 * @status         built
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Select } from '@/components/ui';
import { useRole } from '../hooks/useRole';
import { usePermissionCatalog } from '../hooks/usePermissionCatalog';
import { AssignUsersDialog } from './AssignUsersDialog';
import { DeactivateRoleDialog } from './DeactivateRoleDialog';
import { RoleAllowsPanel } from './RoleAllowsPanel';
import { RoleUsersTable } from './RoleUsersTable';

/** Props of RoleDetailPage. */
interface RoleDetailPageProps {
  /** Id of the role */
  roleId: string;
}

/**
 * Role page. In plain words: the role, its users by company with the assignment date, the company filter, what the role allows, Edit role, Deactivate and Assign users (disabled for an Inactive role).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-05
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies useRole, RoleUsersTable, RoleAllowsPanel, AssignUsersDialog, DeactivateRoleDialog
 *
 * @returns The rendered page
 */
export function RoleDetailPage({ roleId }: RoleDetailPageProps) {
  const { data: role, isPending, isError } = useRole(roleId);
  const labels = Object.fromEntries((usePermissionCatalog().data?.modules ?? []).flatMap((m) => m.permissions.map((p) => [p.key, p.label])));
  const [company, setCompany] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  if (isPending) return <p role="status">Loading the role…</p>;
  if (isError || !role) return <p role="alert">The role could not be loaded. Try again.</p>;
  const companies = [...new Set(role.users.map((u) => u.company))];
  const shown = company ? role.users.filter((u) => u.company === company) : role.users;
  const locked = role.type === 'STANDARD' && role.name === 'Administrator';

  return (
    <section data-testid="roles-detail">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="h3">{role.name}</h1>
          <p className="text-body-secondary">{role.description}</p>
        </div>
        {!locked && (
          <div className="d-flex gap-2">
            <Link href={`/roles/${role.roleId}/edit`} className="btn btn-outline-primary">Edit role</Link>
            {role.status !== 'INACTIVE' && <Button variant="danger" outline onClick={() => setDeactivating(true)}>Deactivate</Button>}
          </div>
        )}
      </div>
      <div className="row">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-end">
            <h2 className="h5">Users with this role</h2>
            <Button onClick={() => setAssigning(true)} disabled={role.status === 'INACTIVE'} data-testid="roles-assign-button">Assign users</Button>
          </div>
          <p className="small text-body-secondary">{role.userCount} users across companies</p>
          <Select label="Company" placeholder="All companies" options={companies.map((c) => ({ value: c, label: c }))} value={company} onChange={(e) => setCompany(e.target.value)} />
          <RoleUsersTable users={shown} />
        </div>
        <div className="col-lg-4">
          <RoleAllowsPanel role={role} labels={labels} />
        </div>
      </div>
      {assigning && <AssignUsersDialog role={role} open onClose={() => setAssigning(false)} />}
      <DeactivateRoleDialog key={deactivating ? role.roleId : 'none'} role={deactivating ? role : null} onClose={() => setDeactivating(false)} />
    </section>
  );
}
