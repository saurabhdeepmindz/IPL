/**
 * @file    StatusBadge.tsx
 * @module  Ui
 *
 * @description
 * The status badge. In plain words: shows Active, Draft or Inactive with a dot and the word, never by colour alone.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/components/ams/StatusBadge.tsx
 * @lld-synced     v0.28
 * @status         built
 */
import { Badge } from '@/components/ui';

/** Props of StatusBadge. */
interface StatusBadgeProps {
  /** The status to show */
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'LOCKED';
}

const LOOK = {
  ACTIVE: { label: 'Active', variant: 'success' },
  DRAFT: { label: 'Draft', variant: 'warning' },
  INACTIVE: { label: 'Inactive', variant: 'secondary' },
  LOCKED: { label: 'Locked', variant: 'danger' },
} as const;

/**
 * Status badge. In plain words: a Badge with a dot and the word, so the status is never shown by colour alone.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.28 §6.5
 * @status    built
 *
 * @dependencies Badge
 *
 * @returns The rendered badge
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, variant } = LOOK[status];
  return (
    <Badge variant={variant} pill dot data-testid="status-badge">
      {label}
    </Badge>
  );
}
