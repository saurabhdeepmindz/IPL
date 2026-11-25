/**
 * @file    PermissionManagementPage.tsx
 * @module  Permissions
 *
 * @description
 * Permission Management page. In plain words: title, the note "Same roles in every company", the filters, the counter with Discard changes, the disabled Review and save, Add role and the matrix (decisions L-95, L-98, L-101, L-103 to L-109).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/components/PermissionManagementPage.tsx
 * @lld-synced     v0.28
 * @status         built
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select } from '@/components/ui';
import { ApiError } from '@/lib/errors';
import { useMatrixChanges } from '../hooks/useMatrixChanges';
import { usePermissionMatrix } from '../hooks/usePermissionMatrix';
import type { CellChange } from '../types/permission.types';
import { PermissionMatrix } from './PermissionMatrix';
import { ReviewChangesPanel } from './ReviewChangesPanel';

const MAX_REVIEW = 200;
type Notice = { kind: 'saved'; count: number } | { kind: 'stale' } | { kind: 'too-many' } | null;

/**
 * Permission Management page. In plain words: loads the matrix, holds the changes in memory and shows the loading, no-access and error with Retry states.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-015
 * @subtask   ST-ADM01-015-FE-02
 * @frd       FR-043.1, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US015-01, 02, 03, 04, 05
 * @lld       LLD-EPIC-ADM-01 v0.27 §6.7
 * @status    built
 *
 * @dependencies usePermissionMatrix, useMatrixChanges, PermissionMatrix
 *
 * @returns The rendered output
 */
export function PermissionManagementPage() {
  const { data: matrix, isPending, error, refetch } = usePermissionMatrix();
  const changes = useMatrixChanges(matrix);
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');
  const [changedOnly, setChangedOnly] = useState(false);
  const [reviewing, setReviewing] = useState<CellChange[] | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const count = changes.changes.length;
  const review = () => {
    if (count > MAX_REVIEW) setNotice({ kind: 'too-many' });
    else {
      setNotice(null);
      setReviewing(changes.changes);
    }
  };

  return (
    <section data-testid="permissions-page">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="h3">Permission Management</h1>
          <p className="text-body-secondary mb-0">What each role may do and whose proposals it can see. Switch a permission on or off, or change its data scope, then review and save with a reason.</p>
        </div>
        <Link href="/roles/new" className="btn btn-primary">
          Add role
        </Link>
      </div>
      <div className="alert alert-info" role="note">
        <strong>Same roles in every company</strong>
        <div>Who has which role in which company is set in User Management. A change here applies to every user with the role, from the moment it is saved.</div>
      </div>
      {notice?.kind === 'saved' && (
        <p className="alert alert-success d-flex justify-content-between" role="status">
          <span>{notice.count === 1 ? '1 change saved' : `${notice.count} changes saved`}</span>
          <Button variant="secondary" outline size="sm" onClick={() => setNotice(null)}>
            Dismiss
          </Button>
        </p>
      )}
      {notice?.kind === 'stale' && <p className="alert alert-warning" role="alert">Another administrator saved first. The matrix was reloaded; make your changes again.</p>}
      {notice?.kind === 'too-many' && <p className="alert alert-warning" role="alert">Review at most 200 changes at a time</p>}
      {isPending && <p role="status">Loading the permission matrix…</p>}
      {error && (
        <p role="alert">
          {error instanceof ApiError && error.status === 403 ? 'You do not have access to Permission Management.' : 'The permission matrix could not be loaded.'}{' '}
          {!(error instanceof ApiError && error.status === 403) && (
            <Button variant="link" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          )}
        </p>
      )}
      {matrix && (
        <>
          <div className="d-flex flex-wrap gap-3 align-items-end mb-3">
            <Input label="Find a permission" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select label="Module" placeholder="All modules" value={module} onChange={(e) => setModule(e.target.value)} options={matrix.groups.map((g) => ({ value: g.module, label: g.module }))} />
            <div className="form-check mb-3">
              <input id="matrix-changed-only" type="checkbox" className="form-check-input" checked={changedOnly} onChange={(e) => setChangedOnly(e.target.checked)} />
              <label htmlFor="matrix-changed-only" className="form-check-label">
                Show changed only
              </label>
            </div>
            <div className="ms-auto d-flex align-items-center gap-3 mb-3">
              {count > 0 && (
                <span data-testid="matrix-counter" role="status">
                  {count === 1 ? '1 unsaved change' : `${count} unsaved changes`}
                </span>
              )}
              {count > 0 && (
                <Button variant="secondary" outline size="sm" onClick={changes.discard}>
                  Discard changes
                </Button>
              )}
              <Button disabled={count === 0} onClick={review}>
                Review and save
              </Button>
            </div>
          </div>
          <PermissionMatrix matrix={matrix} changes={changes} search={search} module={module} changedOnly={changedOnly} />
          <ReviewChangesPanel
            changes={reviewing}
            matrixVersion={matrix.matrixVersion}
            onBack={() => setReviewing(null)}
            onSaved={(n) => {
              changes.discard();
              setReviewing(null);
              setNotice({ kind: 'saved', count: n });
            }}
            onStale={() => {
              changes.discard();
              setReviewing(null);
              setNotice({ kind: 'stale' });
            }}
          />
        </>
      )}
    </section>
  );
}
