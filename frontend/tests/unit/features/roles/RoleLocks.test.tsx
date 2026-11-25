/**
 * @file    RoleLocks.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the locked Administrator role and of deactivate (written before the code). In plain words: the Administrator role shows a lock; a role that users hold is not deactivated.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.22 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.22.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/roles/RoleLocks.test.tsx
 * @lld-synced     v0.22
 * @status         built
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeactivateRoleDialog } from '@/features/roles/components/DeactivateRoleDialog';
import { RolePermissionSwitches } from '@/features/roles/components/RolePermissionSwitches';
import { RoleTable } from '@/features/roles/components/RoleTable';
import { deactivateRole } from '@/features/roles/services/roles.service';
import { ApiError } from '@/lib/errors';
import { CATALOG, ROLES, renderWithQuery } from './roles.fixtures';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/roles' }));
vi.mock('@/features/roles/services/roles.service', () => ({ deactivateRole: vi.fn() }));

describe('Locked role and deactivate (J04, J05)', () => {
  beforeEach(() => {
    vi.mocked(deactivateRole).mockReset();
  });

  /**
   * @tc        TC-ADM01-012-J04
   * @story     US-ADM01-012
   * @ac        AC-US012-04
   * @subtask   ST-ADM01-012-FE-02
   * In plain words: the Administrator role shows a lock and offers no edit or deactivate; a locked permission switch is disabled.
   */
  it('J04 locks the Administrator role', () => {
    render(<RoleTable roles={ROLES} onDeactivate={() => undefined} />);
    const admin = screen.getByRole('row', { name: /Administrator/ });
    expect(within(admin).getByText(/locked/i)).toBeInTheDocument();
    expect(within(admin).queryByRole('button', { name: /Deactivate/ })).not.toBeInTheDocument();
    expect(within(admin).queryByRole('link', { name: /Edit/ })).not.toBeInTheDocument();
    const plant = screen.getByRole('row', { name: /Plant Head/ });
    expect(within(plant).getByRole('button', { name: /Deactivate Plant Head/ })).toBeEnabled();
    render(<RolePermissionSwitches modules={CATALOG.modules} cells={[{ permissionKey: 'users.manage', allowed: true }]} onChange={() => undefined} lockedKeys={['users.manage']} />);
    expect(screen.getByLabelText('Manage users')).toBeDisabled();
    expect(screen.getByLabelText('View users')).toBeEnabled();
  });

  /**
   * @tc        TC-ADM01-012-J05
   * @story     US-ADM01-012
   * @ac        AC-US012-05
   * @subtask   ST-ADM01-012-FE-02
   * In plain words: deactivating a role that 4 users hold shows "4 users hold this role" and the role stays.
   */
  it('J05 shows how many users hold the role', async () => {
    vi.mocked(deactivateRole).mockRejectedValue(new ApiError(409, 'ROLE_IN_USE', 'In use', { userCount: '4' }));
    const onClose = vi.fn();
    renderWithQuery(<DeactivateRoleDialog role={{ ...ROLES[0], roleId: 'r4', name: 'Finance', userCount: 4 }} onClose={onClose} />);
    await userEvent.type(await screen.findByRole('textbox', { name: /^Reason/ }), 'No longer used');
    await userEvent.click(screen.getByTestId('reason-confirm'));
    expect(await screen.findByText('4 users hold this role')).toBeInTheDocument();
    expect(deactivateRole).toHaveBeenCalledWith('r4', 'No longer used');
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onClose).toHaveBeenCalled();
  });
});
