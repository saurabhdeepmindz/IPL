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
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserActionConfirm.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { Button, Modal } from '@/components/ui';
import type { UserActionKind } from '../types/user.types';

/** Props of UserActionConfirm. */
interface UserActionConfirmProps {
  /** The action to confirm; null closes the modal */
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

/**
 * Confirmation modal. In plain words: "Unlock <name>?" or "Reset the password of <name>?" with the e-mail sentence for the two password actions.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-008
 * @subtask   ST-ADM01-008-FE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-06, API-USR-07, API-USR-08
 * @ac        AC-US008-01, 02, 03
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.3
 * @status    built
 *
 * @dependencies Modal, Button
 *
 * @returns The rendered output
 */
const TITLE: Record<UserActionKind, (name: string) => string> = {
  unlock: (name) => `Unlock ${name}`,
  'reset-password': (name) => `Reset the password of ${name}`,
  'resend-otp': (name) => `Resend the one-time password to ${name}`,
};

export function UserActionConfirm({ action, userName, email, onConfirm, onCancel, busy = false }: UserActionConfirmProps) {
  if (!action) return null;
  return (
    <Modal
      open
      onClose={onCancel}
      title={TITLE[action](userName)}
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="secondary" outline onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={busy}>
            Confirm
          </Button>
        </>
      }
    >
      <p className="mb-0">{action === 'unlock' ? `${userName} will be able to sign in again.` : `A new one-time password will be e-mailed to ${email}.`}</p>
    </Modal>
  );
}
