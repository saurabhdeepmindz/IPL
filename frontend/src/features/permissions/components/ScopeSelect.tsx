/**
 * @file    ScopeSelect.tsx
 * @module  Permissions
 *
 * @description
 * Scope list. In plain words: No access, Own, Department or Company for a permission that has a data scope (decision L-96).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/components/ScopeSelect.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import type { CellValue, DataScope } from '../types/permission.types';

const CHOICES: { value: 'NONE' | DataScope; label: string }[] = [
  { value: 'NONE', label: 'No access' },
  { value: 'OWN', label: 'Own' },
  { value: 'DEPARTMENT', label: 'Department' },
  { value: 'COMPANY', label: 'Company' },
];

/** Props of ScopeSelect. */
interface ScopeSelectProps {
  /** The permission label, for the accessible name */
  permission: string;
  /** The role name, for the accessible name */
  role: string;
  /** The value of the cell */
  value: CellValue;
  /** True for a protected right */
  locked: boolean;
  /** True when the cell differs from the saved value */
  changed: boolean;
  /** Called with the new value */
  onChange: (value: CellValue) => void;
}

/**
 * Scope list. In plain words: a list of the four choices in words.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-015
 * @subtask   ST-ADM01-015-FE-02
 * @frd       FR-043.1, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US015-02
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.7
 * @status    built
 *
 * @dependencies Select
 *
 * @returns The rendered output
 */
export function ScopeSelect({ permission, role, value, locked, changed, onChange }: ScopeSelectProps) {
  const current = value.allowed ? (value.scope ?? 'COMPANY') : 'NONE';
  return (
    <div className="d-flex align-items-center justify-content-center gap-2" title={locked ? 'Protected right: it cannot be changed' : undefined}>
      <select
        className="form-select form-select-sm"
        aria-label={`${permission} for ${role}`}
        value={current}
        disabled={locked}
        onChange={(e) => {
          const v = e.target.value as 'NONE' | DataScope;
          onChange(v === 'NONE' ? { allowed: false, scope: null } : { allowed: true, scope: v });
        }}
      >
        {CHOICES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      {locked && <span aria-hidden="true">🔒</span>}
      {locked && <span className="visually-hidden">Protected right: it cannot be changed</span>}
      {changed && <span data-testid="changed-dot" aria-hidden="true" className="text-primary">●</span>}
      {changed && <span className="visually-hidden">changed</span>}
    </div>
  );
}
