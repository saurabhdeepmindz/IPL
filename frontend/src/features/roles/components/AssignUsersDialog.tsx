/**
 * @file    AssignUsersDialog.tsx
 * @module  RolesFeature
 *
 * @description
 * The assign users dialog. In plain words: pick users by search, choose the company and the first day, then give the reason and assign.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/AssignUsersDialog.tsx
 * @lld-synced     v0.20
 * @status         pseudo
 */

'use client';

import { useUserSearch } from '@/features/users';
import { useAssignUsers } from '../hooks/useAssignUsers';
import type { RoleDetails } from '../types/role.types';

/** Props of AssignUsersDialog. */
interface AssignUsersDialogProps {
  /** The role to give */
  role: RoleDetails;
  /** True to show the dialog */
  open: boolean;
  /** Called when the dialog closes */
  onClose: () => void;
}

/**
 * Assign dialog. In plain words: user search (useUserSearch), company and valid-from (required), ReasonDialog, then useAssignUsers.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-06, API-USR-01
 * @ac        AC-US013-01, AC-US013-02, AC-US013-03
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    pseudo
 *
 * @returns The rendered component
 */
export function AssignUsersDialog({ role, open, onClose }: AssignUsersDialogProps) {
  // TODO: 1. Search users with `useUserSearch`; the chosen users are chips.
  // TODO: 2. Company and valid-from are required (messages "Choose a company", "Enter a date").
  // TODO: 3. For Report Viewer or Auditor show the info line that it is added to the user's business role.
  // TODO: 4. Assign opens ReasonDialog; on confirm call useAssignUsers; on success close and refresh.
  // TODO: 5. A 404 or 422 (role inactive) shows its message.
  throw new Error('pseudo-code: not implemented');
}
