/**
 * @file    UserActionConfirm.tsx
 * @module  Users
 *
 * @description
 * Confirmation of an action. In plain words: a modal that names the action and the user, with Cancel and Confirm (decision L-90).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-008
 * @subtask        ST-ADM01-008-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserActionConfirm.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { hf } from '@/hf/hf';
import { HfModal } from '@/hf/HfModal';
import type { UserActionKind } from '../types/user.types';

interface UserActionConfirmProps {
  /** The action to confirm; null closes the window */
  action: UserActionKind | null;
  /** The name of the user */
  userName: string;
  /** The e-mail address of the user, for the password actions */
  email: string;
  /** Called with Confirm */
  onConfirm: () => void;
  /** Called with Cancel */
  onCancel: () => void;
  /** True while the call runs */
  busy?: boolean;
}

const TITLE: Record<UserActionKind, (name: string) => string> = {
  unlock: (name) => `Unlock ${name}`,
  'reset-password': (name) => `Reset the password of ${name}`,
  'resend-otp': (name) => `Resend the one-time password to ${name}`,
};

/**
 * UserActionConfirm.
 *
 * In plain words: the small window that asks "are you sure" before Unlock, Reset password or Resend one-time password, in the look of the design.
 */
export function UserActionConfirm({ action, userName, email, onConfirm, onCancel, busy = false }: UserActionConfirmProps) {
  if (!action) return null;
  return (
    <HfModal
      open
      onClose={onCancel}
      title={TITLE[action](userName)}
      footer={
        <>
          <button type="button" className={hf('btn btn-outline')} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={hf('btn btn-primary')} onClick={onConfirm} disabled={busy}>
            Confirm
          </button>
        </>
      }
    >
      <p style={{ margin: 0 }}>{action === 'unlock' ? `${userName} will be able to sign in again.` : `A new one-time password will be e-mailed to ${email}.`}</p>
    </HfModal>
  );
}
