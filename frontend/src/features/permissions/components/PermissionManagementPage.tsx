'use client';

/**
 * @file    PermissionManagementPage.tsx
 * @module  Permissions
 *
 * @description
 * Permission Management screen. In plain words: HF-ADM-03.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-03
 * @status         built
 */

import { useState } from 'react';
import Link from 'next/link';
import { isForbidden, NoAccess } from '@/components/ams';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { useMatrixChanges } from '../hooks/useMatrixChanges';
import { usePermissionMatrix } from '../hooks/usePermissionMatrix';
import type { CellChange } from '../types/permission.types';
import { PermissionMatrix } from './PermissionMatrix';
import { ReviewChangesPanel } from './ReviewChangesPanel';

const MAX_REVIEW = 200;
type Notice = { kind: 'saved'; count: number } | { kind: 'stale' } | { kind: 'too-many' } | null;

/**
 * PermissionManagementPage.
 *
 * In plain words: the Permission Management screen of the high-fidelity design (HF-ADM-03): page head with Export to Excel (a later release: it opens the Coming soon page) and Add role, the "Same roles in every company" note, one card with the search, module filter, "Show changed only" and the matrix, and the save bar that appears when something is changed.
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
  const touched = new Set(changes.changes.map((c) => c.roleId));
  const affected = (matrix?.roles ?? []).filter((r) => touched.has(r.roleId)).reduce((n, r) => n + r.userCount, 0);

  return (
    <section data-testid="permissions-page">
      <div className={hf('page-head')}>
        <div>
          <h1>Permission Management</h1>
          <p>What each role may do and whose proposals it can see. Switch a permission on or off, or change its data scope, then review and save with a reason.</p>
        </div>
        <div className={hf('page-actions')}>
          <Link className={hf('btn btn-outline')} href="/coming-soon?feature=Export%20to%20Excel" data-testid="matrix-export">
            <HfIcon name="download" />
            Export to Excel
          </Link>
          <Link href="/roles/new" className={hf('btn btn-primary')}>
            <HfIcon name="plus" />
            Add role
          </Link>
        </div>
      </div>
      <div className={hf('alert info')} role="note" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <span>
          <HfIcon name="info" />
        </span>
        <div>
          <b>Same roles in every company</b>
          Who has which role in which company is set in User Management. A change here applies to every user with the role, from the moment it is saved.
        </div>
      </div>
      {notice?.kind === 'saved' && (
        <div className={hf('alert success')} role="status" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <span>
            <HfIcon name="checkC" />
          </span>
          <div>
            <b>{notice.count === 1 ? '1 change saved' : `${notice.count} changes saved`}</b>
          </div>
          <button type="button" className={hf('btn btn-text sm')} onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      )}
      {notice?.kind === 'stale' && (
        <div className={hf('alert warning')} role="alert" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <span>
            <HfIcon name="alert" />
          </span>
          <div>Another administrator saved first. The matrix was reloaded; make your changes again.</div>
        </div>
      )}
      {notice?.kind === 'too-many' && (
        <div className={hf('alert warning')} role="alert" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <span>
            <HfIcon name="alert" />
          </span>
          <div>Review at most 200 changes at a time</div>
        </div>
      )}
      {isPending && <p role="status">Loading the permission matrix…</p>}
      {error && isForbidden(error) && <NoAccess screen="Permission Management" />}
      {error && !isForbidden(error) && (
        <p role="alert">
          The permission matrix could not be loaded.{' '}
          <button type="button" className={hf('btn btn-text sm')} onClick={() => refetch()}>
            Retry
          </button>
        </p>
      )}
      {matrix && (
        <>
          <section className={hf('card')}>
            <div className={hf('toolbar')}>
              <div className={hf('search')} style={{ flex: 1, minWidth: 220, maxWidth: 380 }}>
                <HfIcon name="search" />
                <input className={hf('input')} type="search" placeholder="Find a permission" aria-label="Find a permission" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className={hf('select')} aria-label="Module" value={module} onChange={(e) => setModule(e.target.value)}>
                <option value="">All modules</option>
                {matrix.groups.map((g) => (
                  <option key={g.module} value={g.module}>
                    {g.module}
                  </option>
                ))}
              </select>
              <label className={hf('check')}>
                <input id="matrix-changed-only" type="checkbox" checked={changedOnly} onChange={(e) => setChangedOnly(e.target.checked)} /> Show changed only
              </label>
              <span style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: 'var(--fs-1)', color: 'var(--text-hint)' }}>
                <span>
                  Scope: <b>Own</b> · <b>Department</b> · <b>Company</b>
                </span>
              </div>
            </div>
            <PermissionMatrix matrix={matrix} changes={changes} search={search} module={module} changedOnly={changedOnly} />
          </section>
          {count > 0 && (
            <div className={hf('card')} style={{ position: 'sticky', bottom: 16, marginTop: 'var(--spacing-lg)', boxShadow: 'var(--shadows-shadow-lg)', padding: 'var(--spacing-md) var(--spacing-xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
              <span className={hf('sr-only')} data-testid="matrix-counter" role="status">
                {count === 1 ? '1 unsaved change' : `${count} unsaved changes`}
              </span>
              <span className={hf('count danger')} aria-hidden="true">
                {count}
              </span>
              <b aria-hidden="true">{count === 1 ? 'change not saved' : 'changes not saved'}</b>
              <span className={hf('muted')} style={{ fontSize: 'var(--fs-2)' }}>
                · affects {affected} {affected === 1 ? 'user' : 'users'} in {touched.size} {touched.size === 1 ? 'role' : 'roles'}
              </span>
              <span style={{ flex: 1 }} />
              <button type="button" className={hf('btn btn-outline')} onClick={changes.discard}>
                Discard changes
              </button>
              <button type="button" className={hf('btn btn-primary')} onClick={review}>
                <HfIcon name="check" />
                Review and save
              </button>
            </div>
          )}
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
