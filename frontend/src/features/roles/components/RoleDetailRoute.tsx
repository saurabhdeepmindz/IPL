/**
 * @file    RoleDetailRoute.tsx
 * @module  RolesFeature
 *
 * @description
 * Reads the role id of the role page route. In plain words: unwraps the route parameter (a promise in Next 16) on the client, so the route file stays thin and the page can be prerendered behind a Suspense boundary.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleDetailRoute.tsx
 * @lld-synced     v0.28
 * @status         built
 */
'use client';

import { use } from 'react';
import { RoleDetailPage } from './RoleDetailPage';

/** Props of RoleDetailRoute. */
interface RoleDetailRouteProps {
  /** The route parameters (a promise in Next 16) */
  params: Promise<{ roleId: string }>;
}

/**
 * Role page route content. In plain words: shows the role page for the role id of the route.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-05
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies RoleDetailPage
 *
 * @returns The role page
 */
export function RoleDetailRoute({ params }: RoleDetailRouteProps) {
  const { roleId } = use(params);
  return <RoleDetailPage roleId={roleId} />;
}
