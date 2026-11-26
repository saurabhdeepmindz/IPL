'use client';

/**
 * @file    StatusTabs.tsx
 * @module  Users
 *
 * @description
 * Status tabs. In plain words: All users, Active, Inactive and Locked with their counts, as in the design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-001
 * @subtask        ST-ADM01-001-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-01 #list
 * @status         built
 */

import { hf } from '@/hf/hf';

interface StatusTabsProps {
  counts: { all: number; active: number; inactive: number; locked: number };
  value: 'all' | 'active' | 'inactive' | 'locked';
  onChange: (value: StatusTabsProps['value']) => void;
}

/**
 * StatusTabs.
 *
 * In plain words: the tabs "All users, Active, Inactive, Locked" of the high-fidelity design, each with its count in a grey pill.
 */
export function StatusTabs({ counts, value, onChange }: StatusTabsProps) {
  const tab = (id: StatusTabsProps['value'], label: string, count: number) => (
    <button key={id} type="button" role="tab" aria-selected={value === id} onClick={() => onChange(id)}>
      {label} <span className={hf('badge b-neutral plain')}>{count}</span>
    </button>
  );
  return (
    <div className={hf('tabs')} role="tablist" aria-label="Users by status" style={{ paddingTop: 'var(--spacing-xs)' }}>
      {tab('all', 'All users', counts.all)}
      {tab('active', 'Active', counts.active)}
      {tab('inactive', 'Inactive', counts.inactive)}
      {tab('locked', 'Locked', counts.locked)}
    </div>
  );
}
