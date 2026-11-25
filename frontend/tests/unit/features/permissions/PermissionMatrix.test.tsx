/**
 * @file    PermissionMatrix.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the permission matrix page. In plain words: the grid, the scope lists, the filters, the changed cells with Discard, the locked cells.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/permissions/PermissionMatrix.test.tsx
 * @lld-synced     v0.29
 * @status         elaborated
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionManagementPage } from '@/features/permissions/components/PermissionManagementPage';
import { getMatrix } from '@/features/permissions/services/permissions.service';
import type { PermissionMatrixData } from '@/features/permissions/types/permission.types';
import { ApiError } from '@/lib/errors';

vi.mock('@/features/permissions/services/permissions.service', () => ({ getMatrix: vi.fn(), reviewChanges: vi.fn(), saveChanges: vi.fn() }));

const cell = (allowed: boolean, over: { scope?: 'OWN' | 'DEPARTMENT' | 'COMPANY' | null; locked?: boolean } = {}) => ({ allowed, scope: over.scope ?? null, locked: over.locked ?? false });
const matrix: PermissionMatrixData = {
  matrixVersion: 'v-1',
  roles: [{ roleId: 'r1', name: 'Initiator', userCount: 12 }, { roleId: 'r2', name: 'Administrator', userCount: 1 }],
  groups: [
    {
      module: 'Proposals',
      permissions: [
        { key: 'proposals.create', label: 'Create General proposal', hint: '', cells: { r1: cell(true), r2: cell(false) } },
        { key: 'proposals.view', label: 'View proposals', hint: 'Data scope decides whose proposals', cells: { r1: cell(true, { scope: 'OWN' }), r2: cell(true, { scope: 'COMPANY' }) } },
      ],
    },
    {
      module: 'Users',
      permissions: [
        { key: 'users.view', label: 'View users', hint: '', cells: { r1: cell(false), r2: cell(true) } },
        { key: 'users.manage', label: 'Manage users', hint: 'Add, change and deactivate users', cells: { r1: cell(false), r2: cell(true, { locked: true }) } },
      ],
    },
  ],
};
const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><PermissionManagementPage /></QueryClientProvider>);
const toggle = (permission: string, role: string) => screen.getByRole('switch', { name: `${permission} for ${role}` });
const counter = () => screen.queryByTestId('matrix-counter');

describe('US-ADM01-015 permission matrix (J01 to J05 and supporting)', () => {
  beforeEach(() => {
    vi.mocked(getMatrix).mockReset();
    vi.mocked(getMatrix).mockResolvedValue(matrix);
  });

  /**
   * @tc        TC-ADM01-015-J01
   * @story     US-ADM01-015
   * @ac        AC-US015-01
   * @subtask   ST-ADM01-015-FE-03
   * In plain words: the roles are across with their user counts, the permissions are down under their module, and every switch says On or Off in words.
   */
  it('J01 shows roles across, permissions down by module, On and Off in words', async () => {
    renderPage();
    expect(await screen.findByText('Same roles in every company')).toBeInTheDocument();
    const initiator = await screen.findByRole('columnheader', { name: /Initiator/ });
    expect(within(initiator).getByRole('link', { name: 'Initiator' })).toHaveAttribute('href', '/roles/r1');
    expect(initiator).toHaveTextContent('12 users');
    expect(screen.getByRole('columnheader', { name: /Administrator/ })).toHaveTextContent('1 user');
    expect(screen.getByRole('rowheader', { name: 'Proposals' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Users' })).toBeInTheDocument();
    expect(toggle('Create General proposal', 'Initiator')).toBeChecked();
    expect(toggle('Create General proposal', 'Administrator')).not.toBeChecked();
    const on = toggle('Create General proposal', 'Initiator').closest('td');
    expect(on).toHaveTextContent('On');
    expect(toggle('Create General proposal', 'Administrator').closest('td')).toHaveTextContent('Off');
  });

  /**
   * @tc        TC-ADM01-015-J02
   * @story     US-ADM01-015
   * @ac        AC-US015-02
   * @subtask   ST-ADM01-015-FE-03
   * In plain words: a permission with a data scope shows a list with No access, Own, Department and Company, set to the saved scope.
   */
  it('J02 shows the scope choices in words', async () => {
    renderPage();
    const list = await screen.findByRole('combobox', { name: 'View proposals for Initiator' });
    expect(within(list).getAllByRole('option').map((o) => o.textContent)).toEqual(['No access', 'Own', 'Department', 'Company']);
    expect(list).toHaveValue('OWN');
    expect(screen.getByRole('combobox', { name: 'View proposals for Administrator' })).toHaveValue('COMPANY');
  });

  /**
   * @tc        TC-ADM01-015-J03
   * @story     US-ADM01-015
   * @ac        AC-US015-03
   * @subtask   ST-ADM01-015-FE-03
   * In plain words: Find a permission, the module list and Show changed only narrow the rows; nothing is read again.
   */
  it('J03 narrows the rows with search, module and Show changed only', async () => {
    renderPage();
    await screen.findByText('Create General proposal');
    await userEvent.type(screen.getByLabelText('Find a permission'), 'manage');
    expect(screen.getByRole('rowheader', { name: /Manage users/ })).toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: /Create General proposal/ })).not.toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('Find a permission'));
    await userEvent.selectOptions(screen.getByLabelText('Module'), 'Proposals');
    expect(screen.getByRole('rowheader', { name: /View proposals/ })).toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: /View users/ })).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Module'), '');
    await userEvent.click(toggle('View users', 'Initiator'));
    await userEvent.click(screen.getByLabelText('Show changed only'));
    expect(screen.getByRole('rowheader', { name: /View users/ })).toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: /Create General proposal/ })).not.toBeInTheDocument();
    expect(getMatrix).toHaveBeenCalledTimes(1);
  });

  /**
   * @tc        TC-ADM01-015-J04
   * @story     US-ADM01-015
   * @ac        AC-US015-04
   * @subtask   ST-ADM01-015-FE-03
   * In plain words: a changed switch and a changed scope each show a dot; the counter shows 2; Discard changes returns both cells and removes the counter.
   */
  it('J04 shows dots and the counter and Discard changes returns the cells', async () => {
    renderPage();
    await screen.findByText('Create General proposal');
    expect(counter()).not.toBeInTheDocument();
    await userEvent.click(toggle('View users', 'Initiator'));
    expect(counter()).toHaveTextContent('1 unsaved change');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'View proposals for Initiator' }), 'DEPARTMENT');
    expect(counter()).toHaveTextContent('2 unsaved changes');
    expect(screen.getAllByTestId('changed-dot')).toHaveLength(2);
    expect(toggle('View users', 'Initiator')).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(counter()).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('changed-dot')).toHaveLength(0);
    expect(toggle('View users', 'Initiator')).not.toBeChecked();
    expect(screen.getByRole('combobox', { name: 'View proposals for Initiator' })).toHaveValue('OWN');
  });

  /**
   * @tc        TC-ADM01-015-J05
   * @story     US-ADM01-015
   * @ac        AC-US015-05
   * @subtask   ST-ADM01-015-FE-03
   * In plain words: a locked cell of the Administrator role is disabled with the protected-right text and a click changes nothing.
   */
  it('J05 does not switch a locked cell', async () => {
    renderPage();
    await screen.findByText('Create General proposal');
    const locked = toggle('Manage users', 'Administrator');
    expect(locked).toBeDisabled();
    expect(locked).toBeChecked();
    expect(within(locked.closest('td') as HTMLElement).getByText(/Protected right: it cannot be changed/)).toBeInTheDocument();
    await userEvent.click(locked);
    expect(locked).toBeChecked();
    expect(counter()).not.toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-015
   * @ac      AC-US015-04
   * @subtask ST-ADM01-015-FE-03
   * In plain words: supporting test. A cell put back to its saved value is no longer a change.
   */
  it('a value put back to the saved one is no longer a change', async () => {
    renderPage();
    await screen.findByText('Create General proposal');
    await userEvent.click(toggle('View users', 'Initiator'));
    expect(counter()).toBeInTheDocument();
    await userEvent.click(toggle('View users', 'Initiator'));
    expect(counter()).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('changed-dot')).toHaveLength(0);
  });

  /**
   * @story   US-ADM01-015
   * @ac      AC-US015-04
   * @subtask ST-ADM01-015-FE-03
   * In plain words: supporting test. Review and save is disabled while there is no change and enabled once there is one (decision L-99 until story 016, now story 016); Add role links to the role form.
   */
  it('enables Review and save once there is a change', async () => {
    renderPage();
    await screen.findByText('Create General proposal');
    expect(screen.getByRole('button', { name: 'Review and save' })).toBeDisabled();
    await userEvent.click(toggle('View users', 'Initiator'));
    expect(screen.getByRole('button', { name: 'Review and save' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Add role' })).toHaveAttribute('href', '/roles/new');
  });

  /**
   * @story   US-ADM01-015
   * @ac      AC-US015-01
   * @subtask ST-ADM01-015-FE-03
   * In plain words: supporting test. A 403 shows the no-access message; another error shows a message and Retry, which reads the matrix again.
   */
  it('shows the no-access message and the error with Retry', async () => {
    vi.mocked(getMatrix).mockRejectedValueOnce(new ApiError(403, 'FORBIDDEN', 'No'));
    const first = renderPage();
    expect(await screen.findByText('You do not have access to Permission Management.')).toBeInTheDocument();
    first.unmount();
    vi.mocked(getMatrix).mockRejectedValueOnce(new ApiError(500, 'ERROR', 'Down')).mockResolvedValue(matrix);
    renderPage();
    expect(await screen.findByText('The permission matrix could not be loaded.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Create General proposal')).toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-015
   * @ac      AC-US015-01
   * @subtask ST-ADM01-015-FE-03
   * In plain words: supporting test (decision L-102). A matrix of 2 times the expected size (120 permissions for 12 roles) renders without a list library; the guard is 10 seconds in jsdom and the 3-second budget is measured in the journey E01.
   */
  it('renders a matrix of 2 times the expected size', async () => {
    const roles = Array.from({ length: 12 }, (_, i) => ({ roleId: `r${i}`, name: `Role ${i}`, userCount: i }));
    const groups = Array.from({ length: 6 }, (_, g) => ({
      module: `Module ${g}`,
      permissions: Array.from({ length: 20 }, (_, p) => ({ key: `m${g}.p${p}`, label: `Permission ${g}-${p}`, hint: '', cells: Object.fromEntries(roles.map((r) => [r.roleId, cell(p % 2 === 0, p % 5 === 0 ? { scope: 'OWN' as const } : {})])) })),
    }));
    vi.mocked(getMatrix).mockResolvedValue({ matrixVersion: 'v-big', roles, groups });
    const start = Date.now();
    renderPage();
    expect(await screen.findByText('Permission 5-19', {}, { timeout: 10000 })).toBeInTheDocument();
    expect(Date.now() - start).toBeLessThan(10000);
    expect(screen.getAllByRole('switch').length + screen.getAllByRole('combobox').length).toBeGreaterThan(1000);
  }, 30000);
});
