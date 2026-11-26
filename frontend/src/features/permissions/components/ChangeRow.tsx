/**
 * @file    ChangeRow.tsx
 * @module  Permissions
 *
 * @description
 * One row of the review. In plain words: role, permission, before, after (in words) and users affected.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-016
 * @subtask        ST-ADM01-016-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/components/ChangeRow.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import type { CellState, ReviewRow } from '../types/permission.types';

const SCOPE = { OWN: 'Own', DEPARTMENT: 'Department', COMPANY: 'Company' } as const;

/** A cell in words: On or Off for a yes-or-no permission; No access, Own, Department or Company for a scoped one. */
function words(cell: CellState, scoped: boolean): string {
  if (scoped) return cell.allowed ? SCOPE[cell.scope ?? 'COMPANY'] : 'No access';
  return cell.allowed ? 'On' : 'Off';
}

/** Props of ChangeRow. */
interface ChangeRowProps {
  /** The row of the review */
  row: ReviewRow;
}

/**
 * Change row. In plain words: a table row with the role, the permission, before and after as On, Off, No access, Own, Department or Company, and the users affected.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-016
 * @subtask   ST-ADM01-016-FE-02
 * @frd       FR-043.3
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-02
 * @ac        AC-US016-01
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.7
 * @status    built
 *
 * @returns The rendered output
 */
export function ChangeRow({ row }: ChangeRowProps) {
  const scoped = row.before.scope !== null || row.after.scope !== null;
  return (
    <tr>
      <td>{row.roleName}</td>
      <td>{row.permissionLabel}</td>
      <td>{words(row.before, scoped)}</td>
      <td>{words(row.after, scoped)}</td>
      <td>{row.usersAffected}</td>
    </tr>
  );
}
