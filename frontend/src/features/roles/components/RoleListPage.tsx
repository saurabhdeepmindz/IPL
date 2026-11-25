/**
 * @file    RoleListPage.tsx
 * @module  RolesFeature
 *
 * @description
 * The role list screen. In plain words: the roles with type, what each allows, users, last changed and status; the filters; the note that a final approver is not a role.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleListPage.tsx
 * @lld-synced     v0.25
 * @status         built
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input, Select } from '@/components/ui';
import { useRoles } from '../hooks/useRoles';
import type { Role } from '../types/role.types';
import { DeactivateRoleDialog } from './DeactivateRoleDialog';
import { RoleTable } from './RoleTable';

/**
 * Role list page. In plain words: the heading, the Create role link, the note that a final approver is not a role, the search and the type and status filters, and the table.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-01
 * @ac        AC-US012-01, AC-US012-07
 * @lld       LLD-EPIC-ADM-01 v0.25 §6.5
 * @status    built
 *
 * @dependencies useRoles, RoleTable, DeactivateRoleDialog
 *
 * @returns The rendered page
 */
export function RoleListPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [target, setTarget] = useState<Role | null>(null);
  const filters = { ...(q ? { q } : {}), ...(type ? { type } : {}), ...(status ? { status } : {}) };
  const { data, isPending, isError } = useRoles(filters);

  return (
    <section data-testid="roles-page">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="h3">Role Management</h1>
          <p className="text-body-secondary mb-1">A role groups what a person may do in AMS. Who has which role in which company is set here (Assign users) or on the User Management screen.</p>
          <p className="small mb-0" data-testid="roles-final-approver-note">A final approver is not a role: it is decided by the approval path of each proposal.</p>
        </div>
        <Link href="/roles/new" className="btn btn-primary">
          Create role
        </Link>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <Input label="Search roles" placeholder="Search role name or description" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="col-md-3">
          <Select label="Type" placeholder="All types" options={[{ value: 'STANDARD', label: 'Standard' }, { value: 'CUSTOM', label: 'Custom' }]} value={type} onChange={(e) => setType(e.target.value)} />
        </div>
        <div className="col-md-3">
          <Select label="Status" placeholder="All statuses" options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'DRAFT', label: 'Draft' }, { value: 'INACTIVE', label: 'Inactive' }]} value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>
      </div>
      {isPending && <p role="status">Loading roles…</p>}
      {isError && <p role="alert">The roles could not be loaded. Try again.</p>}
      {data && <RoleTable roles={data.items} onDeactivate={setTarget} />}
      <DeactivateRoleDialog key={target?.roleId ?? 'none'} role={target} onClose={() => setTarget(null)} />
    </section>
  );
}
