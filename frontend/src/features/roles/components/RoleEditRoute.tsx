/**
 * @file    RoleEditRoute.tsx
 * @module  RolesFeature
 *
 * @description
 * Reads the role id of the edit route. In plain words: unwraps the route parameter (a promise in Next 16) on the client, so the route file stays thin and the page can be prerendered behind a Suspense boundary.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleEditRoute.tsx
 * @lld-synced     v0.27
 * @status         built
 */
'use client';

import { use } from 'react';
import { RoleForm } from './RoleForm';

/** Props of RoleEditRoute. */
interface RoleEditRouteProps {
  /** The route parameters (a promise in Next 16) */
  params: Promise<{ roleId: string }>;
}

/**
 * Edit route content.
 *
 * In plain words: shows the role form for the role id of the route.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-02
 * @frd       FR-043.1, FR-043.3
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-03
 * @ac        AC-US012-02
 * @lld       LLD-EPIC-ADM-01 v0.27 §6.5
 * @status    built
 *
 * @dependencies RoleForm
 *
 * @returns The role form
 */
export function RoleEditRoute({ params }: RoleEditRouteProps) {
  const { roleId } = use(params);
  return <RoleForm roleId={roleId} />;
}
