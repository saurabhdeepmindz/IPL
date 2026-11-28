/**
 * @file    UserEditRoute.tsx
 * @module  UsersFeature
 *
 * @description
 * Reads the employee code of the edit route. In plain words: unwraps the route parameter (a promise in Next 16) on the client behind the Suspense boundary of the layout.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserEditRoute.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { use } from 'react';
import { UserForm } from '../UserForm';

/** Props of UserEditRoute. */
interface UserEditRouteProps {
  /** The route parameters (a promise in Next 16) */
  params: Promise<{ employeeCode: string }>;
}

/**
 * Edit route content. In plain words: shows the user form for the code of the route.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @ac        AC-US004-04
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.3
 * @status    built
 *
 * @returns The user form
 */
export function UserEditRoute({ params }: UserEditRouteProps) {
  const { employeeCode } = use(params);
  return <UserForm employeeCode={employeeCode} />;
}
