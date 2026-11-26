'use client';

/**
 * @file    DeactivateRoleDialog.tsx
 * @module  Roles
 *
 * @description
 * Deactivate role dialog. In plain words: HF-ADM-02 deactivate modal.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-02 #deactModal
 * @status         built
 */

import { useState } from 'react';
import { ReasonDialog } from '@/components/ams';
import { hf } from '@/hf/hf';
import { HfModal } from '@/hf/HfModal';
import { toApiError } from '@/lib/errors';
import { useDeactivateRole } from '../hooks/useDeactivateRole';
import type { Role } from '../types/role.types';

interface DeactivateRoleDialogProps {
  role: Role | null;
  onClose: () => void;
}

/**
 * DeactivateRoleDialog.
 *
 * In plain words: the "Deactivate role?" dialog of the design: asks for a reason; a role that people still hold is refused with the number of holders.
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
      <ReasonDialog open={held === null && failure === null} title={`Deactivate ${role.name}`} text="A deactivated role can no longer be given to users." onConfirm={confirm} onCancel={onClose} busy={deactivate.isPending} />
      <HfModal
        open={held !== null || failure !== null}
        onClose={onClose}
        title="The role was not deactivated"
        footer={
          <button type="button" className={hf('btn btn-primary')} onClick={onClose}>
            OK
          </button>
        }
      >
        <p role="alert">{held !== null ? message : failure}</p>
      </HfModal>
    </>
  );
}
