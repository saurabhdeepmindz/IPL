/**
 * @file    StatusTabs.tsx
 * @module  UsersFeature
 *
 * @description
 * The status tabs. In plain words: All, Active, Inactive and Locked with the counts from the API.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/StatusTabs.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { Tabs } from '@/components/ui';

/** Props of StatusTabs. */
interface StatusTabsProps {
  /** The counts of the four tabs */
  counts: { all: number; active: number; inactive: number; locked: number };
  /** The chosen tab */
  value: 'all' | 'active' | 'inactive' | 'locked';
  /** Called when a tab is chosen */
  onChange: (value: StatusTabsProps['value']) => void;
}

/**
 * Status tabs. In plain words: All, Active, Inactive and Locked, each with its word and its count; the count ignores the tab (decision L-44).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-01
 * @ac        AC-US002-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies Tabs
 *
 * @returns The rendered tabs
 */
export function StatusTabs({ counts, value, onChange }: StatusTabsProps) {
  const tab = (id: StatusTabsProps['value'], label: string, count: number) => ({ id, label, count, panel: null });
  return (
    <Tabs
      ariaLabel="Users by status"
      value={value}
      onChange={(id) => onChange(id as StatusTabsProps['value'])}
      tabs={[tab('all', 'All', counts.all), tab('active', 'Active', counts.active), tab('inactive', 'Inactive', counts.inactive), tab('locked', 'Locked', counts.locked)]}
    />
  );
}
