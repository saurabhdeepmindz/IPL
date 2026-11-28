'use client';

/**
 * @file    ReasonDialog.tsx
 * @module  Ams
 *
 * @description
 * Reason dialog. In plain words: the save-with-a-reason dialog of the design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @hf             HF-ADM-02 #saveModal
 * @story         US-ADM01-012, US-ADM01-013
 * @subtask       ST-ADM01-012-FE-04
 * @lld           LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file      docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/components/ams/ReasonDialog.tsx
 * @lld-synced    v0.30
 * @status         built
 */

import { useState } from 'react';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { HfModal } from '@/hf/HfModal';

interface ReasonDialogProps {
  open: boolean;
  title: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  busy?: boolean;
  /** One sentence above the field (what is about to happen). */
  text?: string;
  /** Text of the confirm button. Default "Confirm". */
  confirmLabel?: string;
}

/**
 * ReasonDialog.
 *
 * In plain words: the "save with a reason" dialog of the high-fidelity design: the title, a sentence, the field "Reason for the change" with the note that it is saved in the audit trail, and Back / Confirm. An empty reason is refused.
 */
export function ReasonDialog({ open, title, onConfirm, onCancel, busy = false, text, confirmLabel = 'Confirm' }: ReasonDialogProps) {
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
    <HfModal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button type="button" className={hf('btn btn-danger-outline')} onClick={onCancel} data-testid="reason-cancel">
            Back
          </button>
          <button type="button" className={hf('btn btn-primary')} onClick={confirm} disabled={busy} data-testid="reason-confirm">
            {confirmLabel}
          </button>
        </>
      }
    >
      {text && <p style={{ marginTop: 0 }}>{text}</p>}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          confirm();
        }}
      >
        <div className={hf('field', error && 'invalid')}>
          <label htmlFor="reason-input">
            Reason for the change<span className={hf('req')}>*</span>
          </label>
          <input id="reason-input" className={hf('input')} value={reason} maxLength={500} placeholder="e.g. Approved by CIO, mail of 28-Oct" onChange={(e) => setReason(e.target.value)} />
          <span className={hf('help')}>
            <span>
              <HfIcon name="info" />
            </span>
            Saved in the audit trail with your name and the time.
          </span>
          <span className={hf('err')} role={error ? 'alert' : undefined}>
            <span>
              <HfIcon name="alertC" />
            </span>
            <span>{error}</span>
          </span>
        </div>
      </form>
    </HfModal>
  );
}
