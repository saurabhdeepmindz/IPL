/**
 * @file    UserListPage.tsx
 * @module  UsersFeature
 *
 * @description
 * The user list screen. In plain words: heading, Add user, the saved-notice, the status tabs, the filters and the table with paging.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserListPage.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { NoAccess } from '@/components/ams';
import { Button } from '@/components/ui';
import { ImportUsersButton } from './ImportUsersButton';
import { useRunUserAction } from '../hooks/useUserActions';
import { useUsers } from '../hooks/useUsers';
import type { UserFilters as Filters } from '../types/user.types';
import { StatusTabs } from './StatusTabs';
import { UserActionNotice, type UserActionResult } from './UserActionNotice';
import { UserFilters } from './UserFilters';
import { UserListTable } from './UserListTable';

const NO_COUNTS = { all: 0, active: 0, inactive: 0, locked: 0 };

/**
 * User list page. In plain words: heading, Add user, the notice after a save, the status tabs, the filters and the table with paging; loading, the no-access message, an error with Retry and the empty message with Clear filters (decisions L-73 to L-75).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-01
 * @ac        AC-US002-01, AC-US002-02, AC-US002-03
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies useUsers, StatusTabs, UserFilters, UserListTable
 *
 * @returns The rendered page
 */
export function UserListPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [result, setResult] = useState<UserActionResult | null>(null);
  const [deactivated, setDeactivated] = useState(false);
  const { run } = useRunUserAction(setResult);
  const params = useSearchParams();
  const query = { pageSize: 25, ...filters };
  const { data, isPending, isError, error, refetch } = useUsers(query);
  const created = params.get('created');
  const otp = params.get('otp');
  const denied = isError && (error as { status?: number }).status === 403;
  const page = filters.page ?? 1;
  const pageSize = data?.pageSize ?? 25;

  return (
    <section data-testid="users-page">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="h3">User Management</h1>
          <p className="text-body-secondary mb-0">Who can sign in to AMS, in which companies and with which roles.</p>
        </div>
        <div className="d-flex gap-2">
          <ImportUsersButton />
          <Link href="/users/new" className="btn btn-primary">
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
      <StatusTabs counts={data?.counts ?? NO_COUNTS} value={filters.status ?? 'all'} onChange={(status) => setFilters({ ...filters, status: status === 'all' ? undefined : status, page: 1 })} />
      <UserFilters value={filters} onChange={setFilters} />
      {isPending && <p role="status">Loading users…</p>}
      {denied && <NoAccess screen="User Management" />}
      {isError && !denied && (
        <p role="alert">
          The users could not be loaded.{' '}
          <Button variant="link" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </p>
      )}
      {data && data.items.length === 0 && <p data-testid="users-empty"><span>No users match your search</span>{' '}<Button variant="link" size="sm" onClick={() => setFilters({})}>Clear filters</Button></p>}
      {data && data.items.length > 0 && <UserListTable users={data.items} onResult={(r) => { setDeactivated(false); setResult(r); }} onDeactivated={() => { setResult(null); setDeactivated(true); }} />}
      {data && data.total > pageSize && (
        <div className="d-flex justify-content-between align-items-center">
          <span className="small">Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.total)} of {data.total} users</span>
          <div className="d-flex gap-2">
            <Button variant="secondary" outline size="sm" disabled={page <= 1} onClick={() => setFilters({ ...filters, page: page - 1 })}>Previous</Button>
            <Button variant="secondary" outline size="sm" disabled={page * pageSize >= data.total} onClick={() => setFilters({ ...filters, page: page + 1 })}>Next</Button>
          </div>
        </div>
      )}
    </section>
  );
}
