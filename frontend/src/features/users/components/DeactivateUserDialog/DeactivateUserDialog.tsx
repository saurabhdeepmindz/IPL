/**
 * @file    DeactivateUserDialog.tsx
 * @module  Users
 *
 * @description
 * Deactivate dialog. In plain words: asks for one of 5 reasons and an optional note; on the proposals warning shows the count, the Workflow Monitor address and Continue (decisions D-2, D-6).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-006
 * @subtask        ST-ADM01-006-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/DeactivateUserDialog.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { useState } from 'react';
import { hf } from '@/hf/hf';
import { HfField } from '@/hf/HfField';
import { HfIcon } from '@/hf/HfIcon';
import { HfModal } from '@/hf/HfModal';
import { ApiError } from '@/lib/errors';
import { useDeactivateUser } from '../../hooks/useDeactivateUser';
import { readHolds } from '../../services/users.service';
import type { DeactivationReason, HoldsProposals } from '../../types/user.types';

const REASONS: { value: DeactivationReason; label: string }[] = [
  { value: 'LEFT_COMPANY', label: 'Left the company' },
  { value: 'TRANSFERRED', label: 'Transferred' },
  { value: 'LONG_LEAVE', label: 'On long leave' },
  { value: 'DUPLICATE', label: 'Duplicate user' },
  { value: 'OTHER', label: 'Other' },
];

interface DeactivateUserDialogProps {
  /** The user to deactivate; null closes the dialog */
  user: { employeeCode: string; name: string } | null;
  /** Called when the dialog closes */
  onClose: () => void;
  /** Called after the user has been deactivated */
  onDone: () => void;
}

/**
 * DeactivateUserDialog.
 *
 * In plain words: the "Deactivate user?" window of the design: the reason list and a note; when proposals wait with the user a warning shows them and Continue deactivates anyway.
 */
export function DeactivateUserDialog({ user, onClose, onDone }: DeactivateUserDialogProps) {
  const deactivate = useDeactivateUser();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [held, setHeld] = useState<HoldsProposals | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  // Start empty each time the dialog opens (adjusting state while rendering, as React advises).
  const code = user?.employeeCode ?? null;
  const [wasCode, setWasCode] = useState(code);
  if (code !== wasCode) {
    setWasCode(code);
    setReason('');
    setNote('');
    setReasonError(undefined);
    setHeld(null);
    setFailure(null);
  }

  if (!user) return null;

  const send = (confirmWithProposals: boolean) => {
    if (!reason) {
      setReasonError('Choose a reason');
      return;
    }
    setFailure(null);
    const input = { reason: reason as DeactivationReason, ...(note.trim() ? { note: note.trim() } : {}), ...(confirmWithProposals ? { confirmWithProposals: true } : {}) };
    deactivate.mutate(
      { employeeCode: user.employeeCode, input },
      {
        onSuccess: () => {
          onDone();
          onClose();
        },
        onError: (e) => {
          const holds = e instanceof ApiError ? readHolds(e) : null;
          if (holds) setHeld(holds);
          else setFailure(e instanceof ApiError ? e.message : 'The user was not deactivated. Try again.');
        },
      },
    );
  };

  return (
    <HfModal
      open
      onClose={onClose}
      title={`Deactivate ${user.name}`}
      footer={
        <>
          <button type="button" className={hf('btn btn-outline')} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={hf('btn btn-danger')} onClick={() => send(Boolean(held))} disabled={deactivate.isPending}>
            <HfIcon name="ban" />
            {held ? 'Continue' : 'Confirm'}
          </button>
        </>
      }
    >
      <p style={{ marginTop: 0 }}>They will no longer be able to sign in. History in proposals and the audit trail is kept.</p>
      {held && (
        <div role="alert" className={hf('alert warning')} style={{ marginBottom: 'var(--spacing-lg)' }}>
          <span>
            <HfIcon name="alert" />
          </span>
          <div>
            <b>{held.count === 1 ? '1 proposal is waiting with this user' : `${held.count} proposals are waiting with this user`}</b>
            They will be flagged as workflow exceptions. {held.hasDelegate && 'The user has an active delegate. '}
            <a href={held.workflowMonitorUrl}>Open the Workflow Monitor</a>. Continue deactivates the user anyway.
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
        <HfField label="Reason" htmlFor="deact-reason" required error={reasonError}>
          <select
            id="deact-reason"
            className={hf('select')}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError(undefined);
            }}
          >
            <option value="">Select a reason</option>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </HfField>
        <HfField label="Note (optional)" htmlFor="deact-note">
          <input id="deact-note" className={hf('input')} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
        </HfField>
      </div>
      {failure && (
        <div role="alert" className={hf('alert danger')} style={{ marginTop: 'var(--spacing-lg)' }}>
          <span>
            <HfIcon name="alertC" />
          </span>
          <div>{failure}</div>
        </div>
      )}
    </HfModal>
  );
}
