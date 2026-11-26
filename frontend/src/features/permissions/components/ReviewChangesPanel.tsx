/**
 * @file    ReviewChangesPanel.tsx
 * @module  Permissions
 *
 * @description
 * Review modal. In plain words: the changed cells with before, after and users affected, the warning, the reason and the approval reference, Back to the matrix and Save changes (decisions L-103 to L-109).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-016
 * @subtask        ST-ADM01-016-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/components/ReviewChangesPanel.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { useEffect, useState } from 'react';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { HfModal } from '@/hf/HfModal';
import { ApiError } from '@/lib/errors';
import { useReviewChanges } from '../hooks/useReviewChanges';
import { useSaveChanges } from '../hooks/useSaveChanges';
import type { CellChange } from '../types/permission.types';
import { ChangeRow } from './ChangeRow';
import { SensitiveWarning } from './SensitiveWarning';

/** Props of ReviewChangesPanel. */
interface ReviewChangesPanelProps {
  /** The changes held in memory; null closes the panel */
  changes: CellChange[] | null;
  /** The matrix version the changes were made against */
  matrixVersion: string;
  /** Called with Back to the matrix: the changes are kept */
  onBack: () => void;
  /** Called after a successful save with the number of changes saved */
  onSaved: (saved: number) => void;
  /** Called after a 409 STALE_MATRIX: the page clears its changes */
  onStale: () => void;
}

/**
 * Review modal. In plain words: sends the changes to API-PRM-02, lists the rows, asks for the reason and saves through API-PRM-03; shows the stale, locked-cell and confirmation refusals.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-016
 * @subtask   ST-ADM01-016-FE-02
 * @frd       FR-043.3
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-02, API-PRM-03
 * @ac        AC-US016-01, 02, 03
 * @lld       LLD-EPIC-ADM-01 v0.28 §6.7
 * @status    built
 *
 * @dependencies useReviewChanges, useSaveChanges, ChangeRow, SensitiveWarning, Modal
 *
 * @returns The rendered output
 */
export function ReviewChangesPanel(props: ReviewChangesPanelProps) {
  // The body is mounted fresh each time the panel opens, so its state starts empty.
  return props.changes ? <Body {...props} changes={props.changes} /> : null;
}

function Body({ changes, matrixVersion, onBack, onSaved, onStale }: ReviewChangesPanelProps & { changes: CellChange[] }) {
  const reviewM = useReviewChanges();
  const runReview = reviewM.mutate;
  const save = useSaveChanges();
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [confirmed, setConfirmed] = useState(false);
  const [missing, setMissing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    runReview(changes);
  }, [changes, runReview]);

  const warnings = reviewM.data?.warnings ?? [];
  const rows = (reviewM.data?.rows ?? []).filter((r) => r.changed);
  const blocked = !reviewM.data || rows.length === 0 || (warnings.length > 0 && !confirmed) || save.isPending;

  const submit = () => {
    if (!reason.trim()) {
      setReasonError('Enter a reason');
      return;
    }
    setFailure(null);
    save.mutate(
      { changes, matrixVersion, reason: reason.trim(), ...(reference.trim() ? { approvalReference: reference.trim() } : {}), ...(warnings.length > 0 && confirmed ? { confirmSensitive: true } : {}) },
      {
        onSuccess: (r) => onSaved(r.saved),
        onError: (e) => {
          if (e instanceof ApiError && e.status === 409) onStale();
          else if (e instanceof ApiError && e.code === 'SENSITIVE_CONFIRM_REQUIRED') setMissing(true);
          else if (e instanceof ApiError && e.code === 'LOCKED_CELL') setFailure('A protected right cannot be changed. Nothing was saved.');
          else setFailure(e instanceof ApiError ? e.message : 'The changes were not saved. Try again.');
        },
      },
    );
  };

  return (
    <HfModal
      open
      wide
      onClose={onBack}
      title="Review permission changes"
      footer={
        <>
          <button type="button" className={hf('btn btn-outline')} onClick={onBack}>
            Back to the matrix
          </button>
          <button type="button" className={hf('btn btn-primary')} onClick={submit} disabled={blocked}>
            Save changes
          </button>
        </>
      }
    >
      {reviewM.isPending && <p role="status">Reviewing the changes…</p>}
      {reviewM.isError && <p role="alert">{reviewM.error instanceof ApiError && reviewM.error.code === 'LOCKED_CELL' ? 'A protected right cannot be changed. Nothing was saved.' : 'The changes could not be reviewed. Try again.'}</p>}
      {reviewM.data && rows.length === 0 && <p>These changes do not alter any access</p>}
      {rows.length > 0 && (
        <div className={hf('table-wrap')} style={{ marginBottom: 'var(--spacing-lg)' }}>
          <table className={hf('tbl')}>
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Permission</th>
                <th scope="col">Before</th>
                <th scope="col">After</th>
                <th scope="col">Users affected</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <ChangeRow key={`${r.roleId}|${r.permissionKey}`} row={r} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <SensitiveWarning warnings={warnings} confirmed={confirmed} missing={missing} onChange={(c) => { setConfirmed(c); setMissing(false); }} />
      <div className={hf('field', reasonError && 'invalid')}>
        <label htmlFor="review-reason">
          Reason for the change<span className={hf('req')}>*</span>
        </label>
        <textarea id="review-reason" className={hf('textarea')} value={reason} maxLength={500} placeholder="e.g. Approved by CIO, mail of 28-Oct" onChange={(e) => { setReason(e.target.value); setReasonError(undefined); }} />
        <span className={hf('err')} role={reasonError ? 'alert' : undefined}>
          <span>
            <HfIcon name="alertC" />
          </span>
          <span>{reasonError}</span>
        </span>
      </div>
      <div className={hf('field')}>
        <label htmlFor="review-reference">Approval reference</label>
        <input id="review-reference" className={hf('input')} value={reference} maxLength={100} placeholder="e.g. CR-2026-0142" onChange={(e) => setReference(e.target.value)} />
      </div>
      {failure && (
        <div role="alert" className={hf('alert danger')}>
          <span>
            <HfIcon name="alertC" />
          </span>
          <div>{failure}</div>
        </div>
      )}
    </HfModal>
  );
}
