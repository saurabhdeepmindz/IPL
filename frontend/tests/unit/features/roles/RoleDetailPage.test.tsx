/**
 * @file    RoleDetailPage.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the role page (written before the code). In plain words: holders by company with the assignment date, the company filter, the empty message, Assign users disabled for an Inactive role.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/roles/RoleDetailPage.test.tsx
 * @lld-synced     v0.21
 * @status         built
 */

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleDetailPage } from '@/features/roles/components/RoleDetailPage';
import { getPermissionCatalog, getRole } from '@/features/roles/services/roles.service';
import { useSessionStore } from '@/store/session.store';
import { CATALOG, DETAILS, renderWithQuery } from './roles.fixtures';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/roles/r1' }));
vi.mock('@/features/roles/services/roles.service', () => ({ getRole: vi.fn(), getPermissionCatalog: vi.fn(), assignUsers: vi.fn(), deactivateRole: vi.fn() }));
vi.mock('@/features/users', () => ({ useUserSearch: () => ({ data: undefined }) }));

describe('RoleDetailPage (J01)', () => {
  beforeEach(() => {
    vi.mocked(getRole).mockReset();
    vi.mocked(getPermissionCatalog).mockResolvedValue(CATALOG);
    useSessionStore.getState().signIn({ userId: 'u1', employeeCode: '10001', companyCode: 'IPL' });
  });

  /**
   * @tc        TC-ADM01-013-J01
   * @story     US-ADM01-013
   * @ac        AC-US013-01
   * @subtask   ST-ADM01-013-FE-03
   * In plain words: the holders are listed with department, company and the assignment date; the company filter narrows the list; a role with no holders says "No users have this role yet"; an Inactive role cannot be given to users.
   */
  it('J01 lists the holders and the empty message', async () => {
    vi.mocked(getRole).mockResolvedValue(DETAILS);
    renderWithQuery(<RoleDetailPage roleId="r1" />);
    const sharma = await screen.findByRole('row', { name: /R. Sharma/ });
    expect(within(sharma).getByText('10234')).toBeInTheDocument();
    expect(within(sharma).getByText('Operations')).toBeInTheDocument();
    expect(within(sharma).getByText('IPL')).toBeInTheDocument();
    expect(within(sharma).getByText('01-Apr-2026')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Processor' })).toBeInTheDocument();
    expect(screen.getByTestId('roles-allows')).toHaveTextContent('View users');
    await userEvent.selectOptions(screen.getByLabelText('Company'), 'IPLFB');
    expect(screen.queryByRole('row', { name: /R. Sharma/ })).not.toBeInTheDocument();
    expect(screen.getByRole('row', { name: /A. Singh/ })).toBeInTheDocument();
    expect(screen.getByTestId('roles-assign-button')).toBeEnabled();
  });

  it('shows the empty message and disables Assign users for an Inactive role', async () => {
    vi.mocked(getRole).mockResolvedValue({ ...DETAILS, users: [], status: 'INACTIVE' });
    renderWithQuery(<RoleDetailPage roleId="r1" />);
    expect(await screen.findByText('No users have this role yet')).toBeInTheDocument();
    expect(screen.getByTestId('roles-assign-button')).toBeDisabled();
  });
});
