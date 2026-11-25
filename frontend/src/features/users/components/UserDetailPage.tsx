/**
 * @file    UserDetailPage.tsx
 * @module  Users
 *
 * @description
 * Details page. In plain words: header with Edit user and the red Deactivate (hidden when Inactive), the tabs and the deactivate dialog (decisions D-1, D-7, D-8).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-006
 * @subtask        ST-ADM01-006-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserDetailPage.tsx
 * @lld-synced     v0.25
 * @status         built
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { StatusBadge } from '@/components/ams';
import { ApiError } from '@/lib/errors';
import { useUser } from '../hooks/useUser';
import { DeactivateUserDialog } from './DeactivateUserDialog';
import { UserDetailTabs } from './UserDetailTabs';

/** Props of UserDetailPage. */
interface UserDetailPageProps {
  /** The employee code of the user to show */
  employeeCode: string;
}

/**
 * Details page. In plain words: loads the user, shows the header and tabs, opens the deactivate dialog and shows "User deactivated" afterwards; 404 shows a message and a link to the list.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-006
 * @subtask   ST-ADM01-006-FE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-03, API-USR-05
 * @ac        AC-US006-01, 02
 * @lld       LLD-EPIC-ADM-01 v0.25 §6.3
 * @status    built
 *
 * @dependencies useUser, UserDetailTabs, DeactivateUserDialog, StatusBadge
 *
 * @returns The rendered output
 */
export function UserDetailPage({ employeeCode }: UserDetailPageProps) {
  const { data: user, isPending, error } = useUser(employeeCode);
  const [deactivating, setDeactivating] = useState(false);
  const [done, setDone] = useState(false);

  if (isPending) return <p role="status">Loading the user…</p>;
  if (error || !user) {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <div>
        <p role="alert">{missing ? 'This user was not found' : 'The user could not be loaded. Try again.'}</p>
        <Link href="/users">Back to the list</Link>
      </div>
    );
  }
  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <section data-testid="user-detail">
      <div className="d-flex justify-content-between align-items-start">
        <div className="d-flex gap-3 align-items-center">
          <span className="badge text-bg-light fs-5" aria-hidden="true">{initials}</span>
          <div>
            <h1 className="h3 mb-1">{user.name}</h1>
            <p className="mb-0">
              {user.employeeCode} · {user.designation ?? '-'}, {user.department ?? '-'} <StatusBadge status={user.status} /> <span className="badge text-bg-light border">{user.signIn === 'SSO' ? 'SSO' : 'Local'}</span>
            </p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link href={`/users/${user.employeeCode}/edit`} className="btn btn-outline-primary">
            Edit user
          </Link>
          {user.status !== 'INACTIVE' && (
            <Button variant="danger" outline onClick={() => setDeactivating(true)}>
              Deactivate
            </Button>
          )}
        </div>
      </div>
      {done && (
        <p className="alert alert-success mt-3" role="status">
          User deactivated
        </p>
      )}
      <UserDetailTabs user={user} />
      <DeactivateUserDialog user={deactivating ? user : null} onClose={() => setDeactivating(false)} onDone={() => setDone(true)} />
    </section>
  );
}
