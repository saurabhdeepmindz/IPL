/**
 * @file    ReasonDialog.tsx
 * @module  Ui
 *
 * @description
 * The reason dialog. In plain words: asks for a reason before a save, deactivate or assign, and sends nothing until a reason is typed (decision L-69).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012, US-ADM01-013
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/components/ams/ReasonDialog.tsx
 * @lld-synced     v0.23
 * @status         built
 */
'use client';

import { useState } from 'react';
import { Button, Input, Modal } from '@/components/ui';

/** Props of ReasonDialog. */
interface ReasonDialogProps {
  /** True to show the dialog */
  open: boolean;
  /** Heading of the dialog */
  title: string;
  /** Called with the trimmed reason */
  onConfirm: (reason: string) => void;
  /** Called when the user cancels */
  onCancel: () => void;
  /** True while the call is running; the button is disabled */
  busy?: boolean;
}

/**
 * Reason dialog. In plain words: a Modal with one required text field (up to 500 characters) and Cancel and Confirm buttons; nothing is sent until a reason is typed.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012, US-ADM01-013
 * @subtask   ST-ADM01-012-FE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-06
 * @lld       LLD-EPIC-ADM-01 v0.23 §6.5
 * @status    built
 *
 * @dependencies Modal, Input, Button
 *
 * @returns The rendered dialog
 */
export function ReasonDialog({ open, title, onConfirm, onCancel, busy = false }: ReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>();

  // Start empty each time the dialog opens (adjusting state while rendering, as React advises, instead of an effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setReason('');
      setError(undefined);
    }
  }

  const confirm = () => {
    const clean = reason.trim();
    if (clean.length === 0) {
      setError('Enter a reason');
      return;
    }
    onConfirm(clean);
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="secondary" outline onClick={onCancel} data-testid="reason-cancel">
            Cancel
          </Button>
          <Button onClick={confirm} disabled={busy} data-testid="reason-confirm">
            Confirm
          </Button>
        </>
      }
    >
      <Input label="Reason" required value={reason} maxLength={500} error={error} onChange={(e) => setReason(e.target.value)} />
    </Modal>
  );
}
