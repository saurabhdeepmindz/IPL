/**
 * @file    UserDetailRoute.tsx
 * @module  Users
 *
 * @description
 * Details route content. In plain words: shows the details page for the code of the route.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-006
 * @subtask        ST-ADM01-006-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserDetailRoute.tsx
 * @lld-synced     v0.29
 * @status         pseudo
 */
'use client';

import { use } from 'react';
import { UserDetailPage } from './UserDetailPage';

/** Props of UserDetailRoute. */
interface UserDetailRouteProps {
  /** The route parameters (a promise in Next 16) */
  params: Promise<{ employeeCode: string }>;
}

/**
 * Details route content. In plain words: reads the code from the route and shows the details page.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-006
 * @subtask   ST-ADM01-006-FE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-03
 * @ac        AC-US006-01
 * @lld       LLD-EPIC-ADM-01 v0.29 §6.3
 * @status    pseudo
 *
 * @dependencies UserDetailPage
 *
 * @returns The rendered output
 */
export function UserDetailRoute({ params }: UserDetailRouteProps) {
  const { employeeCode } = use(params);
  return <UserDetailPage employeeCode={employeeCode} />;
}
