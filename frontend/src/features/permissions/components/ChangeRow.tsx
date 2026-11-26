'use client';

/**
 * @file    ChangeRow.tsx
 * @module  Permissions
 *
 * @description
 * Review row. In plain words: one changed cell in the review table.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-03 #revModal
 * @status         built
 */

import type { CellState, ReviewRow } from '../types/permission.types';

const SCOPE = { OWN: 'Own', DEPARTMENT: 'Department', COMPANY: 'Company' } as const;

function words(cell: CellState, scoped: boolean): string {
  if (scoped) return cell.allowed ? SCOPE[cell.scope ?? 'COMPANY'] : 'No access';
  return cell.allowed ? 'On' : 'Off';
}

interface ChangeRowProps {
  row: ReviewRow;
}

/**
 * ChangeRow.
 *
 * In plain words: one line of the review table: role, permission, the value before and after in words, and how many users it touches.
 */
export function ChangeRow({ row }: ChangeRowProps) {
  const scoped = row.before.scope !== null || row.after.scope !== null;
  return (
    <tr>
      <td>{row.roleName}</td>
      <td>{row.permissionLabel}</td>
      <td>{words(row.before, scoped)}</td>
      <td>{words(row.after, scoped)}</td>
      <td className="hf-num">{row.usersAffected}</td>
    </tr>
  );
}
