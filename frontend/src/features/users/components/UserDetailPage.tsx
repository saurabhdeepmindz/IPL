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
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserDetailPage.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isForbidden, NoAccess } from '@/components/ams';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { ApiError } from '@/lib/errors';
import { useRunUserAction } from '../hooks/useUserActions';
import { useUser } from '../hooks/useUser';
import { DeactivateUserDialog } from './DeactivateUserDialog';
import { UserActionNotice, type UserActionResult } from './UserActionNotice';
import { UserDetailTabs } from './UserDetailTabs';
import { UserRowMenu } from './UserRowMenu';

interface UserDetailPageProps {
  /** The employee code of the user to show */
  employeeCode: string;
}

const STATUS: Record<string, [string, string]> = { ACTIVE: ['b-success', 'Active'], INACTIVE: ['b-neutral', 'Inactive'], LOCKED: ['b-danger', 'Locked'] };

/**
 * UserDetailPage.
 *
 * In plain words: the user details of the design (HF-ADM-01 #view): one card with the profile head (avatar, name, code, designation and department, status and sign-in badges, Edit user, Deactivate and the more-actions menu) and the three tabs below it; the action notice shows between them.
 */
export function UserDetailPage({ employeeCode }: UserDetailPageProps) {
  const { data: user, isPending, error } = useUser(employeeCode);
  const [deactivating, setDeactivating] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<UserActionResult | null>(null);
  const { run } = useRunUserAction(setResult);

  if (isPending) return <p role="status">Loading the user…</p>;
  if (error && isForbidden(error)) return <NoAccess screen="user details" />;
  if (error || !user) {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <div>
        <p role="alert">{missing ? 'This user was not found' : 'The user could not be loaded. Try again.'}</p>
        <Link href="/users">Back to the list</Link>
      </div>
    );
  }
  const initials = user.name.replace(/[^A-Z]/g, '').slice(0, 2) || user.name.slice(0, 2).toUpperCase();
  const [cls, word] = STATUS[user.status] ?? ['b-neutral', user.status];

  return (
    <section data-testid="user-detail">
      <div className={hf('card')} style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <div className={hf('profile-head')}>
          <span className={hf('avatar lg')} aria-hidden="true">
            {initials}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ font: '600 var(--fs-6)/32px var(--font-heading)', margin: 0 }}>{user.name}</h1>
            <div className={hf('meta')}>
              <span className={hf('mono')}>{user.employeeCode}</span>
              <span>·</span>
              <span>
                {user.designation ?? '-'}, {user.department ?? '-'}
              </span>
              <span className={hf('badge', cls)} data-testid="status-badge">
                {word}
              </span>
              <span className={hf('badge plain', user.signIn === 'SSO' ? 'b-primary' : 'b-neutral')}>{user.signIn === 'SSO' ? 'SSO' : 'Local'}</span>
            </div>
          </div>
          <div className={hf('page-actions')}>
            <UserRowMenu user={user} place="details" onResult={setResult} onDeactivated={() => setDone(true)} />
            <Link href={`/users/${user.employeeCode}/edit`} className={hf('btn btn-outline')}>
              <HfIcon name="edit" size="sm" />
              Edit user
            </Link>
            {user.status !== 'INACTIVE' && (
              <button type="button" className={hf('btn btn-danger-outline')} onClick={() => setDeactivating(true)}>
                <HfIcon name="ban" size="sm" />
                Deactivate
              </button>
            )}
          </div>
        </div>
        {(done || result) && (
          <div style={{ padding: '0 var(--spacing-xl)' }}>
            {done && (
              <div className={hf('alert success')} role="status" style={{ margin: 'var(--spacing-lg) 0' }}>
                <span>
                  <HfIcon name="checkC" />
                </span>
                <div>User deactivated</div>
              </div>
            )}
            <UserActionNotice result={result} onRepeat={(action, code) => void run({ employeeCode: code, email: user.email }, action)} onDismiss={() => setResult(null)} />
          </div>
        )}
        <UserDetailTabs user={user} />
      </div>
      <DeactivateUserDialog user={deactivating ? user : null} onClose={() => setDeactivating(false)} onDone={() => setDone(true)} />
    </section>
  );
}
