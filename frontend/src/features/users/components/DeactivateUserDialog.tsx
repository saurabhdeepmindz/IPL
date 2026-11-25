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
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/DeactivateUserDialog.tsx
 * @lld-synced     v0.28
 * @status         built
 */
'use client';

import { useState } from 'react';
import { Button, Input, Modal, Select } from '@/components/ui';
import { ApiError } from '@/lib/errors';
import { useDeactivateUser } from '../hooks/useDeactivateUser';
import { readHolds } from '../services/users.service';
import type { DeactivationReason, HoldsProposals } from '../types/user.types';

const REASONS: { value: DeactivationReason; label: string }[] = [
  { value: 'LEFT_COMPANY', label: 'Left the company' },
  { value: 'TRANSFERRED', label: 'Transferred' },
  { value: 'LONG_LEAVE', label: 'On long leave' },
  { value: 'DUPLICATE', label: 'Duplicate user' },
  { value: 'OTHER', label: 'Other' },
];

/** Props of DeactivateUserDialog. */
interface DeactivateUserDialogProps {
  /** The user to deactivate; null closes the dialog */
  user: { employeeCode: string; name: string } | null;
  /** Called when the dialog closes */
  onClose: () => void;
  /** Called after the user has been deactivated */
  onDone: () => void;
}

/**
 * Deactivate dialog. In plain words: reason list and note; 409 HOLDS_PROPOSALS shows the count and Continue; 422 LAST_ADMINISTRATOR shows its message.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-006
 * @subtask   ST-ADM01-006-FE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-05
 * @ac        AC-US006-01, 02
 * @lld       LLD-EPIC-ADM-01 v0.25 §6.3
 * @status    built
 *
 * @dependencies useDeactivateUser, Modal, Select, Input
 *
 * @returns The rendered output
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
    <Modal
      open
      onClose={onClose}
      title={`Deactivate ${user.name}`}
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="secondary" outline onClick={onClose}>
            Cancel
          </Button>
          {held ? (
            <Button variant="danger" onClick={() => send(true)} disabled={deactivate.isPending}>
              Continue
            </Button>
          ) : (
            <Button variant="danger" onClick={() => send(false)} disabled={deactivate.isPending}>
              Confirm
            </Button>
          )}
        </>
      }
    >
      <Select label="Reason" required placeholder="Select a reason" value={reason} error={reasonError} options={REASONS} onChange={(e) => { setReason(e.target.value); setReasonError(undefined); }} />
      <Input label="Note (optional)" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
      {held && (
        <div role="alert" className="alert alert-warning mt-3">
          <p className="mb-1">{held.count === 1 ? '1 proposal is waiting with this user' : `${held.count} proposals are waiting with this user`}</p>
          {held.hasDelegate && <p className="mb-1">The user has an active delegate.</p>}
          <a href={held.workflowMonitorUrl}>Open the Workflow Monitor</a>
          <p className="mb-0 mt-1">Continue deactivates the user anyway.</p>
        </div>
      )}
      {failure && (
        <p role="alert" className="alert alert-danger mt-3 mb-0">
          {failure}
        </p>
      )}
    </Modal>
  );
}
