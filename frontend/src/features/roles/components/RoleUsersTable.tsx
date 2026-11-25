/**
 * @file    RoleUsersTable.tsx
 * @module  RolesFeature
 *
 * @description
 * The users of a role. In plain words: a table of user, department, company and assigned-on date; the empty message "No users have this role yet".
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleUsersTable.tsx
 * @lld-synced     v0.20
 * @status         pseudo
 */

'use client';

import type { RoleHolder } from '../types/role.types';

/** Props of RoleUsersTable. */
interface RoleUsersTableProps {
  /** The holders of the role */
  users: RoleHolder[];
}

/**
 * Users table. In plain words: no Remove action in this release (decision L-65).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    pseudo
 *
 * @returns The rendered component
 */
export function RoleUsersTable({ users }: RoleUsersTableProps) {
  // TODO: 1. Render the rows; the date as DD-MMM-YYYY.
  // TODO: 2. No rows: show the empty message.
  throw new Error('pseudo-code: not implemented');
}
