/**
 * @file    roles.fixtures.tsx
 * @module  Tests
 *
 * @description
 * Test helpers of the roles screens. In plain words: a query client around a component and sample roles and a sample permission catalog.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/roles/roles.fixtures.tsx
 * @lld-synced     v0.26
 * @status         built
 */

import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { PermissionCatalog, Role, RoleDetails } from '@/features/roles/types/role.types';

/** Render a component with a fresh query client that never retries. */
export function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const role = (over: Partial<Role>): Role => ({ roleId: 'r0', name: 'Role', description: 'A role', type: 'STANDARD', userCount: 0, lastChanged: '2026-10-28T10:00:00Z', status: 'ACTIVE', ...over });

/** Sample roles: two standard (one is the Administrator), one custom draft. */
export const ROLES: Role[] = [
  role({ roleId: 'r1', name: 'Initiator', description: 'Creates proposals', userCount: 142 }),
  role({ roleId: 'r2', name: 'Administrator', description: 'System role', userCount: 4, lastChanged: '2026-04-01T10:00:00Z' }),
  role({ roleId: 'r3', name: 'Plant Head', description: 'Raises plant proposals', type: 'CUSTOM', userCount: 0, status: 'DRAFT', lastChanged: '2026-12-01T10:00:00Z' }),
];

/** A small catalog: one module with a scoped and an unscoped permission. */
export const CATALOG: PermissionCatalog = {
  modules: [{ name: 'Users', permissions: [{ key: 'users.view', label: 'View users', hint: 'See the list', scoped: true }, { key: 'users.manage', label: 'Manage users', hint: '', scoped: false }] }],
  cellsByRole: { r1: { 'users.view': { allowed: true, scope: 'COMPANY', locked: false }, 'users.manage': { allowed: false, scope: null, locked: false } } },
};

/** A role page with two holders in two companies. */
export const DETAILS: RoleDetails = {
  ...ROLES[0],
  roleId: 'r1',
  name: 'Processor',
  users: [
    { employeeCode: '10234', name: 'R. Sharma', department: 'Operations', company: 'IPL', assignedOn: '2026-04-01' },
    { employeeCode: '10044', name: 'A. Singh', department: 'HR', company: 'IPLFB', assignedOn: '2026-12-02' },
  ],
  allows: [{ permission: 'users.view', scope: 'OWN' }],
};
