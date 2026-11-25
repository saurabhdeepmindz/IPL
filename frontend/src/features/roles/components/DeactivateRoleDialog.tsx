/**
 * @file    DeactivateRoleDialog.tsx
 * @module  RolesFeature
 *
 * @description
 * The deactivate role dialog. In plain words: asks for a reason, then deactivates; a role that users hold shows how many and is not deactivated.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/DeactivateRoleDialog.tsx
 * @lld-synced     v0.29
 * @status         built
 */
'use client';

import { useState } from 'react';
import { ReasonDialog } from '@/components/ams';
import { Button, Modal } from '@/components/ui';
import { toApiError } from '@/lib/errors';
import { useDeactivateRole } from '../hooks/useDeactivateRole';
import type { Role } from '../types/role.types';

/** Props of DeactivateRoleDialog. */
interface DeactivateRoleDialogProps {
  /** The role to deactivate; null closes the dialog */
  role: Role | null;
  /** Called when the dialog closes */
  onClose: () => void;
}

/**
 * Deactivate dialog. In plain words: asks for a reason, then deactivates; a role that users hold shows how many and stays (ROLE_IN_USE).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-04
 * @ac        AC-US012-04, AC-US012-05
 * @lld       LLD-EPIC-ADM-01 v0.29 §6.5
 * @status    built
 *
 * @dependencies useDeactivateRole, ReasonDialog
 *
 * @returns The rendered dialogs
 */
export function DeactivateRoleDialog({ role, onClose }: DeactivateRoleDialogProps) {
  const deactivate = useDeactivateRole();
  const [held, setHeld] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  if (!role) return null;

  const confirm = (reason: string) =>
    deactivate.mutate(
      { roleId: role.roleId, reason },
      {
        onSuccess: onClose,
        onError: (err) => {
          const e = toApiError(err);
          if (e.code === 'ROLE_IN_USE') setHeld(e.fields.userCount ?? String(role.userCount));
          else setFailure(e.message);
        },
      },
    );
  const message = held === '1' ? '1 user holds this role' : `${held} users hold this role`;

  return (
    <>
      <ReasonDialog open={held === null && failure === null} title={`Deactivate ${role.name}`} onConfirm={confirm} onCancel={onClose} busy={deactivate.isPending} />
      <Modal open={held !== null || failure !== null} onClose={onClose} title="The role was not deactivated" footer={<Button onClick={onClose}>OK</Button>}>
        <p role="alert">{held !== null ? message : failure}</p>
      </Modal>
    </>
  );
}
