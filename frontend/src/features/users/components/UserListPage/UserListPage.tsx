'use client';

/**
 * @file    UserListPage.tsx
 * @module  Users
 *
 * @description
 * User Management screen. In plain words: HF-ADM-01 list view.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-001
 * @subtask        ST-ADM01-001-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-01 #list
 * @status         built
 */

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { NoAccess } from '@/components/ams';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { ImportUsersButton } from '../ImportUsersButton';
import { useRunUserAction } from '../../hooks/useUserActions';
import { useUsers } from '../../hooks/useUsers';
import type { UserFilters as Filters } from '../../types/user.types';
import { StatusTabs } from '../StatusTabs';
import { UserActionNotice, type UserActionResult } from '../UserActionNotice';
import { UserFilters } from '../UserFilters';
import { UserListTable } from '../UserListTable';

const NO_COUNTS = { all: 0, active: 0, inactive: 0, locked: 0 };

/**
 * UserListPage.
 *
 * In plain words: the User Management screen of the high-fidelity design (HF-ADM-01): page head with Import users and Add user, one card with the status tabs, the toolbar, the table and the pager "Showing 10 of 25 users".
 */
export function UserListPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [result, setResult] = useState<UserActionResult | null>(null);
  const [deactivated, setDeactivated] = useState(false);
  const { run } = useRunUserAction(setResult);
  const params = useSearchParams();
  const sort = filters.sort ?? 'name:asc';
  const query = { pageSize: 10, ...filters };
  const { data, isPending, isError, error, refetch } = useUsers(query);
  const created = params.get('created');
  const otp = params.get('otp');
  const denied = isError && (error as { status?: number }).status === 403;
  const page = filters.page ?? 1;
  const pageSize = data?.pageSize ?? 10;
  const pages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <section data-testid="users-page">
      <div className={hf('page-head')}>
        <div>
          <h1>User Management</h1>
          <p>Add IPL employees, give them access to one or more companies with roles, and activate or deactivate accounts. Users sign in with IPL single sign-on or a local password.</p>
        </div>
        <div className={hf('page-actions')}>
          <ImportUsersButton />
          <Link href="/users/new" className={hf('btn btn-primary')}>
            <HfIcon name="plus" />
            Add user
          </Link>
        </div>
      </div>
      {created && (
        <p className="alert alert-success" role="status" data-testid="users-notice">
          User {created} was saved.
          {otp === 'SENT' && ' The one-time password was e-mailed.'}
          {otp === 'FAILED' && ' E-mail failed: use Resend once the details screen exists.'}
        </p>
      )}
      <UserActionNotice result={result} onRepeat={(action, code) => result && void run({ employeeCode: code, email: result.email }, action)} onDismiss={() => setResult(null)} />
      {deactivated && (
        <p className="alert alert-success" role="status">
          User deactivated
        </p>
      )}
      <div className={hf('card')}>
        <StatusTabs counts={data?.counts ?? NO_COUNTS} value={filters.status ?? 'all'} onChange={(status) => setFilters({ ...filters, status: status === 'all' ? undefined : status, page: 1 })} />
        <UserFilters value={filters} onChange={setFilters} />
        {isPending && (
          <p role="status" style={{ padding: 'var(--spacing-xl)' }}>
            Loading users…
          </p>
        )}
        {denied && <NoAccess screen="User Management" />}
        {isError && !denied && (
          <p role="alert" style={{ padding: 'var(--spacing-xl)' }}>
            The users could not be loaded.{' '}
            <button type="button" className={hf('btn btn-text sm')} onClick={() => refetch()}>
              Retry
            </button>
          </p>
        )}
        {data && data.items.length === 0 && (
          <div className={hf('empty')} data-testid="users-empty">
            <span className={hf('art')}>
              <HfIcon name="search" size="lg" />
            </span>
            <b>No users match your search</b>
            <p>Check the employee code or name, or clear the filters. New employees are added with &quot;Add user&quot; or through Excel import.</p>
            <button type="button" className={hf('btn btn-outline')} onClick={() => setFilters({})}>
              Clear filters
            </button>
          </div>
        )}
        {data && data.items.length > 0 && (
          <UserListTable
            users={data.items}
            sort={sort}
            onSort={(field) => setFilters({ ...filters, sort: sort.startsWith(`${field}:`) ? `${field}:${sort.endsWith(':asc') ? 'desc' : 'asc'}` : `${field}:asc`, page: 1 })}
            onResult={(r) => {
              setDeactivated(false);
              setResult(r);
            }}
            onDeactivated={() => {
              setResult(null);
              setDeactivated(true);
            }}
          />
        )}
        {data && data.items.length > 0 && (
          <div className={hf('pager')}>
            <div className={hf('size')}>
              Showing{' '}
              <select className={hf('select')} aria-label="Rows per page" value={pageSize} onChange={(e) => setFilters({ ...filters, pageSize: Number(e.target.value), page: 1 })}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>{' '}
              of {data.total} users
            </div>
            <div className={hf('pages')}>
              <button type="button" disabled={page <= 1} aria-label="Previous page" onClick={() => setFilters({ ...filters, page: page - 1 })}>
                <HfIcon name="chevL" size="sm" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" aria-current={n === page ? 'page' : undefined} onClick={() => setFilters({ ...filters, page: n })}>
                  {n}
                </button>
              ))}
              <button type="button" disabled={page >= pages} aria-label="Next page" onClick={() => setFilters({ ...filters, page: page + 1 })}>
                <HfIcon name="chevR" size="sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
