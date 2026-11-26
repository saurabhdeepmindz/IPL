'use client';

/**
 * @file    ScopeSelect.tsx
 * @module  Permissions
 *
 * @description
 * Scope list. In plain words: the data-scope list of the matrix.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-03
 * @status         built
 */

import { hf } from '@/hf/hf';
import type { CellValue, DataScope } from '../types/permission.types';

const CHOICES: { value: 'NONE' | DataScope; label: string }[] = [
  { value: 'NONE', label: '—' },
  { value: 'OWN', label: 'Own' },
  { value: 'DEPARTMENT', label: 'Department' },
  { value: 'COMPANY', label: 'Company' },
];

interface ScopeSelectProps {
  permission: string;
  role: string;
  value: CellValue;
  locked: boolean;
  changed: boolean;
  onChange: (value: CellValue) => void;
}

/**
 * ScopeSelect.
 *
 * In plain words: the data-scope list of one permission for one role (No access, Own, Department, Company) in the design's list style; a protected right is disabled; a changed cell carries a dot.
 */
export function ScopeSelect({ permission, role, value, locked, changed, onChange }: ScopeSelectProps) {
  const current = value.allowed ? (value.scope ?? 'COMPANY') : 'NONE';
  return (
    <>
      <select
        className={hf('select')}
        aria-label={`${permission} for ${role}`}
        value={current}
        disabled={locked}
        title={locked ? 'Protected right: it cannot be changed' : undefined}
        onChange={(e) => {
          const v = e.target.value as 'NONE' | DataScope;
          onChange(v === 'NONE' ? { allowed: false, scope: null } : { allowed: true, scope: v });
        }}
      >
        {CHOICES.map((c) => (
          <option key={c.value} value={c.value} aria-label={c.value === 'NONE' ? 'No access' : undefined}>
            {c.label}
          </option>
        ))}
      </select>
      {locked && <span className={hf('sr-only')}>Protected right: it cannot be changed</span>}
      {changed && (
        <>
          <span data-testid="changed-dot" className={hf('sr-only')}>
            changed
          </span>
        </>
      )}
    </>
  );
}
