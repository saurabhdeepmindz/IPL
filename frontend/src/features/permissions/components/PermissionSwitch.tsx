/**
 * @file    PermissionSwitch.tsx
 * @module  Permissions
 *
 * @description
 * Permission switch. In plain words: a switch with the word On or Off; a locked cell is disabled with a lock symbol; a changed cell has a dot (decisions L-96 to L-98).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/components/PermissionSwitch.tsx
 * @lld-synced     v0.27
 * @status         built
 */
'use client';

import { Switch } from '@/components/ui';

/** Props of PermissionSwitch. */
interface PermissionSwitchProps {
  /** The permission label, for the accessible name */
  permission: string;
  /** The role name, for the accessible name */
  role: string;
  /** True when allowed */
  checked: boolean;
  /** True for a protected right */
  locked: boolean;
  /** True when the cell differs from the saved value */
  changed: boolean;
  /** Called with the new value */
  onChange: (checked: boolean) => void;
}

/**
 * Permission switch. In plain words: one yes-or-no cell.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-015
 * @subtask   ST-ADM01-015-FE-02
 * @frd       FR-043.1, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US015-01, 02, 03, 04, 05
 * @lld       LLD-EPIC-ADM-01 v0.27 §6.7
 * @status    built
 *
 * @dependencies Switch
 *
 * @returns The rendered output
 */
export function PermissionSwitch({ permission, role, checked, locked, changed, onChange }: PermissionSwitchProps) {
  return (
    <div className="d-flex align-items-center justify-content-center gap-2" title={locked ? 'Protected right: it cannot be changed' : undefined}>
      <Switch label={checked ? 'On' : 'Off'} aria-label={`${permission} for ${role}`} checked={checked} disabled={locked} onChange={onChange} className="mb-0" />
      {locked && <span aria-hidden="true">🔒</span>}
      {locked && <span className="visually-hidden">Protected right: it cannot be changed</span>}
      {changed && <span data-testid="changed-dot" aria-hidden="true" className="text-primary">●</span>}
      {changed && <span className="visually-hidden">changed</span>}
    </div>
  );
}
