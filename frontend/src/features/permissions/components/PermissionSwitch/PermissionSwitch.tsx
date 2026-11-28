'use client';

/**
 * @file    PermissionSwitch.tsx
 * @module  Permissions
 *
 * @description
 * Permission toggle. In plain words: the matrix toggle of the design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @hf             HF-ADM-03
 * @story         US-ADM01-015
 * @subtask       ST-ADM01-015-FE-02
 * @lld           LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file      docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/components/PermissionSwitch.tsx
 * @lld-synced    v0.30
 * @status         built
 */

import { hf } from '@/hf/hf';

interface PermissionSwitchProps {
  permission: string;
  role: string;
  checked: boolean;
  locked: boolean;
  changed: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * PermissionSwitch.
 *
 * In plain words: the toggle of one permission for one role in the matrix of the design; a protected right is disabled with its reason as the tooltip; a changed cell carries a dot.
 */
export function PermissionSwitch({ permission, role, checked, locked, changed, onChange }: PermissionSwitchProps) {
  return (
    <label className={hf('toggle')} title={locked ? 'Protected right: it cannot be changed' : undefined}>
      <input type="checkbox" role="switch" aria-label={`${permission} for ${role}`} checked={checked} disabled={locked} onChange={(e) => onChange(e.target.checked)} />
      <span className={hf('track')} />
      <span className={hf('sr-only')}>{checked ? 'On' : 'Off'}</span>
      {locked && <span className={hf('sr-only')}>Protected right: it cannot be changed</span>}
      {changed && (
        <>
          <span data-testid="changed-dot" className={hf('sr-only')}>
            changed
          </span>
        </>
      )}
    </label>
  );
}
