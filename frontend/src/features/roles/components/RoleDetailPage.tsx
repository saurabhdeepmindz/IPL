/**
 * @file    RoleDetailPage.tsx
 * @module  RolesFeature
 *
 * @description
 * The role page. In plain words: the role, its users by company with the assignment date, the company filter, "what this role allows" and the Assign users button.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleDetailPage.tsx
 * @lld-synced     v0.20
 * @status         pseudo
 */

'use client';

import { useRole } from '../hooks/useRole';

/** Props of RoleDetailPage. */
interface RoleDetailPageProps {
  /** Id of the role */
  roleId: string;
}

/**
 * Role page. In plain words: useRole with the company filter; Edit role and Deactivate for roles that are not locked; Assign users disabled for an Inactive role.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-05
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    pseudo
 *
 * @dependencies useRole, RoleUsersTable, RoleAllowsPanel, AssignUsersDialog
 *
 * @returns The rendered component
 */
export function RoleDetailPage({ roleId }: RoleDetailPageProps) {
  // TODO: 1. Load the role with `useRole(roleId, company)`.
  // TODO: 2. Render RoleUsersTable, RoleAllowsPanel, the company filter and the Assign users button.
  // TODO: 3. Disable Assign users when the role is Inactive.
  throw new Error('pseudo-code: not implemented');
}
