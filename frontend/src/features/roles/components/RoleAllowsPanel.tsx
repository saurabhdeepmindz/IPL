/**
 * @file    RoleAllowsPanel.tsx
 * @module  RolesFeature
 *
 * @description
 * What the role allows. In plain words: the allowed permissions with their scope, the type, status and last changed.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleAllowsPanel.tsx
 * @lld-synced     v0.20
 * @status         pseudo
 */

'use client';

import type { RoleDetails } from '../types/role.types';

/** Props of RoleAllowsPanel. */
interface RoleAllowsPanelProps {
  /** The role with its allows */
  role: RoleDetails;
}

/**
 * Allows panel. In plain words: a list with a check symbol; text as well as symbol.
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
export function RoleAllowsPanel({ role }: RoleAllowsPanelProps) {
  // TODO: 1. List `role.allows` in words.
  // TODO: 2. Show type, status, companies ("Same role in every company") and last changed.
  throw new Error('pseudo-code: not implemented');
}
