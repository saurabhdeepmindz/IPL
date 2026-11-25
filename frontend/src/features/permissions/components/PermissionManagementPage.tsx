/**
 * @file    PermissionManagementPage.tsx
 * @module  Permissions
 *
 * @description
 * Permission Management page. In plain words: title, the note "Same roles in every company", the filters, the counter with Discard changes, the disabled Review and save, Add role and the matrix (decisions L-95, L-98, L-99, L-101).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/components/PermissionManagementPage.tsx
 * @lld-synced     v0.27
 * @status         built
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select } from '@/components/ui';
import { ApiError } from '@/lib/errors';
import { useMatrixChanges } from '../hooks/useMatrixChanges';
import { usePermissionMatrix } from '../hooks/usePermissionMatrix';
import { PermissionMatrix } from './PermissionMatrix';

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
  const count = changes.changes.length;

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
              <Button disabled title="Review comes with the next screen">
                Review and save
              </Button>
              <span className="small text-body-secondary">Review comes with the next screen</span>
            </div>
          </div>
          <PermissionMatrix matrix={matrix} changes={changes} search={search} module={module} changedOnly={changedOnly} />
        </>
      )}
    </section>
  );
}
