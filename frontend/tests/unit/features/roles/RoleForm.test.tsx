/**
 * @file    RoleForm.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the role form (written before the code). In plain words: create after the reason, the name-exists message, no call before a reason.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/roles/RoleForm.test.tsx
 * @lld-synced     v0.20
 * @status         built
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleForm } from '@/features/roles/components/RoleForm';
import { createRole, getPermissionCatalog, listRoles } from '@/features/roles/services/roles.service';
import { ApiError } from '@/lib/errors';
import { CATALOG, renderWithQuery } from './roles.fixtures';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/roles/new' }));
vi.mock('@/features/roles/services/roles.service', () => ({ createRole: vi.fn(), updateRole: vi.fn(), getPermissionCatalog: vi.fn(), listRoles: vi.fn() }));

const fill = async (name = 'Plant Head') => {
  await userEvent.type(screen.getByLabelText(/Role name/), name);
  await userEvent.type(screen.getByLabelText(/Description/), 'Runs the plant');
};

describe('RoleForm (J02, J03, J06)', () => {
  beforeEach(() => {
    push.mockClear();
    vi.mocked(createRole).mockReset();
    vi.mocked(getPermissionCatalog).mockResolvedValue(CATALOG);
    vi.mocked(listRoles).mockResolvedValue({ items: [] });
  });

  /**
   * @tc        TC-ADM01-012-J02
   * @story     US-ADM01-012
   * @ac        AC-US012-02
   * @subtask   ST-ADM01-012-FE-02
   * In plain words: with a unique name, a description and a reason the create call is sent with those fields and the list is opened.
   */
  it('J02 sends the create call after the reason', async () => {
    vi.mocked(createRole).mockResolvedValue({ roleId: 'r9' });
    renderWithQuery(<RoleForm />);
    await screen.findByText('View users');
    await fill();
    await userEvent.click(screen.getByLabelText('View users'));
    await userEvent.click(screen.getByTestId('roles-save-button'));
    await userEvent.type(await screen.findByRole('textbox', { name: /^Reason/ }), 'New plant role');
    await userEvent.click(screen.getByTestId('reason-confirm'));
    await waitFor(() => expect(createRole).toHaveBeenCalled());
    expect(vi.mocked(createRole).mock.calls[0][0]).toMatchObject({ name: 'Plant Head', description: 'Runs the plant', status: 'ACTIVE', reason: 'New plant role', permissions: [{ permissionKey: 'users.view', allowed: true }] });
    await waitFor(() => expect(push).toHaveBeenCalledWith('/roles'));
  });

  /**
   * @tc        TC-ADM01-012-J03
   * @story     US-ADM01-012
   * @ac        AC-US012-03
   * @subtask   ST-ADM01-012-FE-02
   * In plain words: a 409 ROLE_NAME_EXISTS shows its message on the name field and the form stays open.
   */
  it('J03 shows the name-exists message', async () => {
    vi.mocked(createRole).mockRejectedValue(new ApiError(409, 'ROLE_NAME_EXISTS', 'Exists', { name: 'A role with this name already exists' }));
    renderWithQuery(<RoleForm />);
    await screen.findByText('View users');
    await fill('Initiator');
    await userEvent.click(screen.getByTestId('roles-save-button'));
    await userEvent.type(await screen.findByRole('textbox', { name: /^Reason/ }), 'Try');
    await userEvent.click(screen.getByTestId('reason-confirm'));
    expect(await screen.findByText('A role with this name already exists')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  /**
   * @tc        TC-ADM01-012-J06
   * @story     US-ADM01-012
   * @ac        AC-US012-06
   * @subtask   ST-ADM01-012-FE-02
   * In plain words: no call is sent until a reason is typed; an empty reason shows "Enter a reason"; an empty name or description stops before the dialog.
   */
  it('J06 requires a reason before any save', async () => {
    renderWithQuery(<RoleForm />);
    await screen.findByText('View users');
    await userEvent.click(screen.getByTestId('roles-save-button'));
    expect(await screen.findByText('Enter a unique name up to 40 characters')).toBeInTheDocument();
    expect(screen.getByText('Enter a description')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await fill();
    await userEvent.click(screen.getByTestId('roles-save-button'));
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByTestId('reason-confirm'));
    expect(screen.getByText('Enter a reason')).toBeInTheDocument();
    expect(createRole).not.toHaveBeenCalled();
  });
});
