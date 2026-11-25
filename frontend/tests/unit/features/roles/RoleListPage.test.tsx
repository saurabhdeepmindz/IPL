/**
 * @file    RoleListPage.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the role list (written before the code). In plain words: the list with type, users, last changed and status, the filters, and the final-approver note.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/roles/RoleListPage.test.tsx
 * @lld-synced     v0.20
 * @status         built
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleListPage } from '@/features/roles/components/RoleListPage';
import { listRoles } from '@/features/roles/services/roles.service';
import { ROLES, renderWithQuery } from './roles.fixtures';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/roles' }));
vi.mock('@/features/roles/services/roles.service', () => ({ listRoles: vi.fn(), deactivateRole: vi.fn() }));

describe('RoleListPage (J01, J07)', () => {
  beforeEach(() => {
    vi.mocked(listRoles).mockReset();
    vi.mocked(listRoles).mockImplementation(async (q) => ({ items: ROLES.filter((r) => (!q.type || r.type === q.type) && (!q.status || r.status === q.status)) }));
  });

  /**
   * @tc        TC-ADM01-012-J01
   * @story     US-ADM01-012
   * @ac        AC-US012-01
   * @subtask   ST-ADM01-012-FE-02
   * In plain words: the roles are listed with type, users, last changed and status; choosing a type or a status asks for that filter.
   */
  it('J01 lists roles and filters by type and status', async () => {
    renderWithQuery(<RoleListPage />);
    const row = await screen.findByRole('row', { name: /Initiator/ });
    expect(within(row).getByText('Standard')).toBeInTheDocument();
    expect(within(row).getByText('142')).toBeInTheDocument();
    expect(within(row).getByText('28-Oct-2026')).toBeInTheDocument();
    expect(within(row).getByText('Active')).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Plant Head/ })).toHaveTextContent('Draft');
    await userEvent.selectOptions(screen.getByLabelText('Type'), 'CUSTOM');
    await waitFor(() => expect(listRoles).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'CUSTOM' })));
    await waitFor(() => expect(screen.queryByRole('row', { name: /Initiator/ })).not.toBeInTheDocument());
    expect(screen.getByRole('row', { name: /Plant Head/ })).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Type'), '');
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'ACTIVE');
    await waitFor(() => expect(listRoles).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'ACTIVE' })));
    await waitFor(() => expect(screen.queryByRole('row', { name: /Plant Head/ })).not.toBeInTheDocument());
  });

  /**
   * @tc        TC-ADM01-012-J07
   * @story     US-ADM01-012
   * @ac        AC-US012-07
   * @subtask   ST-ADM01-012-FE-02
   * In plain words: the page says that a final approver is not a role and lists only what the API returns, with a link to create a role.
   */
  it('J07 shows the final-approver note', async () => {
    renderWithQuery(<RoleListPage />);
    expect(await screen.findByTestId('roles-final-approver-note')).toHaveTextContent('A final approver is not a role');
    expect(screen.getByRole('link', { name: 'Create role' })).toHaveAttribute('href', '/roles/new');
    expect(listRoles).toHaveBeenCalledWith({});
  });
});
