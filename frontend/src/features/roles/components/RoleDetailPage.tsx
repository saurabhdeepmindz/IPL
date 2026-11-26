'use client';

/**
 * @file    RoleDetailPage.tsx
 * @module  Roles
 *
 * @description
 * Role details. In plain words: HF-ADM-02 view.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-02 #view
 * @status         built
 */

import { useState } from 'react';
import Link from 'next/link';
import { isForbidden, NoAccess } from '@/components/ams';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { useRole } from '../hooks/useRole';
import { usePermissionCatalog } from '../hooks/usePermissionCatalog';
import { AssignUsersDialog } from './AssignUsersDialog';
import { DeactivateRoleDialog } from './DeactivateRoleDialog';
import { RoleAllowsPanel } from './RoleAllowsPanel';
import { RoleUsersTable } from './RoleUsersTable';

interface RoleDetailPageProps {
  roleId: string;
}

/**
 * RoleDetailPage.
 *
 * In plain words: the role details screen of the design (HF-ADM-02 #view): the role icon, name and description with Edit role and Deactivate, the "Users with this role" card (search, company filter, table, pager) and the "What this role allows" card.
 */
export function RoleDetailPage({ roleId }: RoleDetailPageProps) {
  const { data: role, isPending, isError, error } = useRole(roleId);
  const labels = Object.fromEntries((usePermissionCatalog().data?.modules ?? []).flatMap((m) => m.permissions.map((p) => [p.key, p.label])));
  const [company, setCompany] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  if (isPending) return <p role="status">Loading the role…</p>;
  if (isError && isForbidden(error)) return <NoAccess screen="role details" />;
  if (isError || !role) return <p role="alert">The role could not be loaded. Try again.</p>;
  const companies = [...new Map(role.users.map((u) => [u.company, u.companyName ? `${u.companyName} · ${u.company}` : u.company])).entries()];
  const shown = role.users.filter((u) => (!company || u.company === company) && (!q || `${u.name} ${u.employeeCode}`.toLowerCase().includes(q.toLowerCase())));
  const [by, dir] = sort.split(':');
  const key = (u: (typeof shown)[number]): string => (by === 'department' ? (u.department ?? '') : by === 'company' ? u.company : by === 'since' ? u.assignedOn : u.name.toLowerCase());
  if (by) shown.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0) * (dir === 'desc' ? -1 : 1));
  const locked = role.type === 'STANDARD' && role.name === 'Administrator';

  return (
    <section data-testid="roles-detail">
      <div className={hf('page-head')}>
        <div className={hf('role-name')}>
          <span className={hf('role-ico', locked && 'sys')} style={{ width: 48, height: 48 }}>
            <HfIcon name={locked ? 'lock' : 'shield'} />
          </span>
          <div>
            <h1>{role.name}</h1>
            <p style={{ marginTop: 2 }}>{role.description}</p>
          </div>
        </div>
        {!locked && (
          <div className={hf('page-actions')}>
            <Link href={`/roles/${role.roleId}/edit`} className={hf('btn btn-outline')}>
              <HfIcon name="edit" size="sm" />
              Edit role
            </Link>
            {role.status !== 'INACTIVE' && (
              <button type="button" className={hf('btn btn-danger-outline')} onClick={() => setDeactivating(true)}>
                <HfIcon name="ban" size="sm" />
                Deactivate
              </button>
            )}
          </div>
        )}
      </div>
      <div className={hf('split')}>
        <section className={hf('card')} aria-labelledby="ua">
          <div className={hf('card-head')}>
            <div>
              <h2 id="ua">Users with this role</h2>
              <p>{role.userCount} users across companies{role.users.length < role.userCount ? ` · showing a sample of ${role.users.length}` : ''}</p>
            </div>
            <button type="button" className={hf('btn btn-primary sm')} onClick={() => setAssigning(true)} disabled={role.status === 'INACTIVE'} data-testid="roles-assign-button">
              <HfIcon name="plus" />
              Assign users
            </button>
          </div>
          <div className={hf('toolbar')}>
            <div className={hf('search')} style={{ flex: 1, maxWidth: 360 }}>
              <HfIcon name="search" />
              <input className={hf('input')} type="search" placeholder="Search user" aria-label="Search users with this role" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <select className={hf('select')} aria-label="Company" value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">All companies</option>
              {companies.map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <RoleUsersTable users={shown} sort={sort} onSort={(field) => setSort(sort.startsWith(`${field}:`) ? `${field}:${sort.endsWith(':asc') ? 'desc' : 'asc'}` : `${field}:asc`)} />
          {shown.length > 0 && (
            <div className={hf('pager')}>
              <div className={hf('size')}>
                Showing{' '}
                <select className={hf('select')} aria-label="Rows per page" defaultValue={10}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>{' '}
                of {shown.length} users
              </div>
              <div className={hf('pages')}>
                <button type="button" disabled aria-label="Previous page">
                  <HfIcon name="chevL" size="sm" />
                </button>
                <button type="button" aria-current="page">
                  1
                </button>
                <button type="button" disabled aria-label="Next page">
                  <HfIcon name="chevR" size="sm" />
                </button>
              </div>
            </div>
          )}
        </section>
        <RoleAllowsPanel role={role} labels={labels} />
      </div>
      {assigning && <AssignUsersDialog role={role} open onClose={() => setAssigning(false)} />}
      <DeactivateRoleDialog key={deactivating ? role.roleId : 'none'} role={deactivating ? role : null} onClose={() => setDeactivating(false)} />
    </section>
  );
}
