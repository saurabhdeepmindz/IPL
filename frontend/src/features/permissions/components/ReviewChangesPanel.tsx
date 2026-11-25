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
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/components/ReviewChangesPanel.tsx
 * @lld-synced     v0.29
 * @status         built
 */
'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Modal } from '@/components/ui';
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
    <Modal
      open
      onClose={onBack}
      title="Review changes"
      size="lg"
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="secondary" outline onClick={onBack}>
            Back to the matrix
          </Button>
          <Button onClick={submit} disabled={blocked}>
            Save changes
          </Button>
        </>
      }
    >
      {reviewM.isPending && <p role="status">Reviewing the changes…</p>}
      {reviewM.isError && <p role="alert">{reviewM.error instanceof ApiError && reviewM.error.code === 'LOCKED_CELL' ? 'A protected right cannot be changed. Nothing was saved.' : 'The changes could not be reviewed. Try again.'}</p>}
      {reviewM.data && rows.length === 0 && <p>These changes do not alter any access</p>}
      {rows.length > 0 && (
        <table className="table">
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
      )}
      <SensitiveWarning warnings={warnings} confirmed={confirmed} missing={missing} onChange={(c) => { setConfirmed(c); setMissing(false); }} />
      <Input label="Reason" required value={reason} maxLength={500} error={reasonError} onChange={(e) => { setReason(e.target.value); setReasonError(undefined); }} />
      <Input label="Approval reference (optional)" value={reference} maxLength={100} onChange={(e) => setReference(e.target.value)} />
      {failure && (
        <p role="alert" className="alert alert-danger mb-0">
          {failure}
        </p>
      )}
    </Modal>
  );
}
