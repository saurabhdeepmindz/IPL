'use client';

/**
 * @file    RoleListPage.tsx
 * @module  Roles
 *
 * @description
 * Role Management screen. In plain words: HF-ADM-02 list view.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-02 #list
 * @status         built
 */

import { useState } from 'react';
import Link from 'next/link';
import { isForbidden, NoAccess } from '@/components/ams';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { useRoles } from '../../hooks/useRoles';
import type { Role } from '../../types/role.types';
import { DeactivateRoleDialog } from '../DeactivateRoleDialog';
import { RoleTable } from '../RoleTable';

/** Sort key of a role for a column of the table. */
function keyOf(r: Role, field: string): string | number {
  if (field === 'users') return r.userCount;
  if (field === 'changed') return r.lastChanged;
  if (field === 'type') return r.type;
  if (field === 'status') return r.status;
  return r.name.toLowerCase();
}

/**
 * RoleListPage.
 *
 * In plain words: the Role Management screen of the high-fidelity design (HF-ADM-02): page head with Permission Management and Create role, one card with the search, the type and status filters, the table and the pager, and the note about the final approver.
 */
export function RoleListPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Role | null>(null);
  const filters = { ...(q ? { q } : {}), ...(type ? { type } : {}), ...(status ? { status } : {}) };
  const { data, isPending, isError, error } = useRoles(filters);
  const [by, dir] = sort.split(':');
  const all = [...(data?.items ?? [])];
  if (by) all.sort((a, b) => (keyOf(a, by) < keyOf(b, by) ? -1 : keyOf(a, by) > keyOf(b, by) ? 1 : 0) * (dir === 'desc' ? -1 : 1));
  const pages = Math.max(1, Math.ceil(all.length / pageSize));
  const rows = all.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize);
  const current = Math.min(page, pages);

  return (
    <section data-testid="roles-page">
      <div className={hf('page-head')}>
        <div>
          <h1>Role Management</h1>
          <p>A role groups what a person may do in AMS. Roles are the same in every company; who has which role in which company is set here (Assign users) or on the User Management screen.</p>
        </div>
        <div className={hf('page-actions')}>
          <Link className={hf('btn btn-outline')} href="/permissions">
            <HfIcon name="key" />
            Permission Management
          </Link>
          <Link href="/roles/new" className={hf('btn btn-primary')}>
            <HfIcon name="plus" />
            Create role
          </Link>
        </div>
      </div>
      <div className={hf('card')}>
        <div className={hf('toolbar')}>
          <div className={hf('search')} style={{ flex: 1, maxWidth: 420 }}>
            <HfIcon name="search" />
            <input className={hf('input')} type="search" placeholder="Search role name or description" aria-label="Search roles" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className={hf('select')} aria-label="Role type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <option value="STANDARD">Standard</option>
            <option value="CUSTOM">Custom</option>
          </select>
          <select className={hf('select')} aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        {isPending && (
          <p role="status" style={{ padding: 'var(--spacing-xl)' }}>
            Loading roles…
          </p>
        )}
        {isError && (isForbidden(error) ? <NoAccess screen="Role Management" /> : <p role="alert" style={{ padding: 'var(--spacing-xl)' }}>The roles could not be loaded. Try again.</p>)}
        {data && rows.length === 0 && (
          <div className={hf('empty')}>
            <span className={hf('art')}>
              <HfIcon name="shield" size="lg" />
            </span>
            <b>No roles match</b>
            <p>Try another word, or clear the filters.</p>
          </div>
        )}
        {data && rows.length > 0 && (
          <RoleTable
            roles={rows}
            onDeactivate={setTarget}
            sort={sort}
            onSort={(field) => setSort(sort.startsWith(`${field}:`) ? `${field}:${sort.endsWith(':asc') ? 'desc' : 'asc'}` : `${field}:asc`)}
          />
        )}
        {data && all.length > 0 && (
          <div className={hf('pager')}>
            <div className={hf('size')}>
              Showing{' '}
              <select className={hf('select')} aria-label="Rows per page" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>{' '}
              of {all.length} roles
            </div>
            <div className={hf('pages')}>
              <button type="button" disabled={current <= 1} aria-label="Previous page" onClick={() => setPage(current - 1)}>
                <HfIcon name="chevL" size="sm" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" aria-current={n === current ? 'page' : undefined} onClick={() => setPage(n)}>
                  {n}
                </button>
              ))}
              <button type="button" disabled={current >= pages} aria-label="Next page" onClick={() => setPage(current + 1)}>
                <HfIcon name="chevR" size="sm" />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className={hf('alert info')} style={{ marginTop: 'var(--spacing-xl)' }} data-testid="roles-final-approver-note">
        <span>
          <HfIcon name="info" />
        </span>
        <div>
          <b>Final approver (terminator) is not a role</b>
          It is the last position on a proposal&apos;s approval path and must meet the DoA matrix. Processors become final approvers when they are placed last on the path.
        </div>
      </div>
      <DeactivateRoleDialog key={target?.roleId ?? 'none'} role={target} onClose={() => setTarget(null)} />
    </section>
  );
}
