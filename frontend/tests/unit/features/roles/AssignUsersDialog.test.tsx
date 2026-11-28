/**
 * @file    AssignUsersDialog.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the assign dialog (written before the code). In plain words: search and pick users, company and first day, the reason, the page refresh and the info line for Report Viewer.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/roles/AssignUsersDialog.test.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleDetailPage } from '@/features/roles/components/RoleDetailPage';
import { assignUsers, getPermissionCatalog, getRole } from '@/features/roles/services/roles.service';
import { listUsers } from '@/features/users/services/users.service';
import { useSessionStore } from '@/store/session.store';
import { CATALOG, DETAILS, renderWithQuery } from './roles.fixtures';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/roles/r1' }));
vi.mock('@/features/roles/services/roles.service', () => ({ getRole: vi.fn(), getPermissionCatalog: vi.fn(), assignUsers: vi.fn(), deactivateRole: vi.fn() }));
vi.mock('@/features/users/services/users.service', () => ({ listUsers: vi.fn() }));

const open = async () => {
  renderWithQuery(<RoleDetailPage roleId="r1" />);
  await userEvent.click(await screen.findByTestId('roles-assign-button'));
};

describe('AssignUsersDialog (J02, J03)', () => {
  beforeEach(() => {
    vi.mocked(getRole).mockReset();
    vi.mocked(assignUsers).mockReset();
    vi.mocked(getPermissionCatalog).mockResolvedValue(CATALOG);
    vi.mocked(listUsers).mockResolvedValue({ items: [{ employeeCode: '10388', name: 'K. Pillai', department: 'Operations' }], total: 1 } as never);
    useSessionStore.getState().signIn({ userId: 'u1', employeeCode: '10001', companyCode: 'IPL' });
  });

  /**
   * @tc        TC-ADM01-013-J02
   * @story     US-ADM01-013
   * @ac        AC-US013-02
   * @subtask   ST-ADM01-013-FE-03
   * In plain words: company, first day and at least one user are required; with them and a reason the assign call is sent and the role page is read again and shows the new user.
   */
  it('J02 refreshes the role after the assign', async () => {
    vi.mocked(getRole).mockResolvedValueOnce(DETAILS).mockResolvedValue({ ...DETAILS, users: [...DETAILS.users, { employeeCode: '10388', name: 'K. Pillai', department: 'Operations', company: 'IPL', assignedOn: '2026-12-01' }] });
    vi.mocked(assignUsers).mockResolvedValue({ assigned: 1 });
    await open();
    await userEvent.click(screen.getByTestId('assign-submit'));
    expect(await screen.findByText('Choose at least one user')).toBeInTheDocument();
    expect(screen.getByText('Choose a company')).toBeInTheDocument();
    expect(screen.getByText('Enter a date')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Search users'), 'pil');
    await userEvent.click(await screen.findByRole('button', { name: /Add K. Pillai/ }));
    await userEvent.selectOptions(screen.getByLabelText(/Company/, { selector: 'select#assign-company' }), 'IPL');
    await userEvent.type(screen.getByLabelText(/Valid from/), '2026-12-01');
    await userEvent.click(screen.getByTestId('assign-submit'));
    await userEvent.type(await screen.findByRole('textbox', { name: /^Reason/ }), 'New plant team');
    await userEvent.click(screen.getByTestId('reason-confirm'));
    await waitFor(() => expect(assignUsers).toHaveBeenCalledWith('r1', { employeeCodes: ['10388'], companyCode: 'IPL', validFrom: '2026-12-01', reason: 'New plant team' }));
    expect(await screen.findByRole('row', { name: /K. Pillai/ }, { timeout: 10000 })).toBeInTheDocument();
  });

  /**
   * @tc        TC-ADM01-013-J03
   * @story     US-ADM01-013
   * @ac        AC-US013-03
   * @subtask   ST-ADM01-013-FE-03
   * In plain words: for Report Viewer or Auditor the dialog says it is added to the business role; for another role it does not.
   */
  it('J03 shows the info line for Report Viewer', async () => {
    vi.mocked(getRole).mockResolvedValue({ ...DETAILS, name: 'Report Viewer' });
    await open();
    expect(await screen.findByTestId('assign-info')).toHaveTextContent(/added to the user's business role/i);
  });

  it('does not show the info line for another role', async () => {
    vi.mocked(getRole).mockResolvedValue(DETAILS);
    await open();
    await screen.findByLabelText('Search users');
    expect(screen.queryByTestId('assign-info')).not.toBeInTheDocument();
  });
});
