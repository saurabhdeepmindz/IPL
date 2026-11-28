/**
 * @file    ReviewChanges.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the review and save. In plain words: the rows and the reason, the sensitive warning, the locked-cell refusal, and the supporting stale, Back and notice cases.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-016
 * @subtask        ST-ADM01-016-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/permissions/ReviewChanges.test.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionManagementPage } from '@/features/permissions/components/PermissionManagementPage';
import { getMatrix, reviewChanges, saveChanges } from '@/features/permissions/services/permissions.service';
import type { PermissionMatrixData, ReviewResult, ReviewRow } from '@/features/permissions/types/permission.types';
import { ApiError } from '@/lib/errors';

vi.mock('@/features/permissions/services/permissions.service', () => ({ getMatrix: vi.fn(), reviewChanges: vi.fn(), saveChanges: vi.fn() }));

const cell = (allowed: boolean, over: { scope?: 'OWN' | 'DEPARTMENT' | 'COMPANY' | null; locked?: boolean } = {}) => ({ allowed, scope: over.scope ?? null, locked: over.locked ?? false });
const matrix: PermissionMatrixData = {
  matrixVersion: 'v-1',
  roles: [{ roleId: 'r1', name: 'Initiator', userCount: 12 }, { roleId: 'r2', name: 'Administrator', userCount: 1 }],
  groups: [
    {
      module: 'Users',
      permissions: [
        { key: 'users.view', label: 'View users', hint: '', cells: { r1: cell(false), r2: cell(true) } },
        { key: 'users.manage', label: 'Manage users', hint: '', cells: { r1: cell(false), r2: cell(true, { locked: true }) } },
      ],
    },
  ],
};
const row = (over: Partial<ReviewRow> = {}): ReviewRow => ({
  roleId: 'r1', roleName: 'Initiator', permissionKey: 'users.view', permissionLabel: 'View users',
  before: { allowed: false, scope: null }, after: { allowed: true, scope: null }, usersAffected: 12, sensitive: false, changed: true, ...over,
});
const review = (rows: ReviewRow[], warnings: string[] = []): ReviewResult => ({ rows, warnings });
const client = () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
const renderPage = () => render(<QueryClientProvider client={client()}><PermissionManagementPage /></QueryClientProvider>);
const toggle = (permission: string, role: string) => screen.getByRole('switch', { name: `${permission} for ${role}` });
const openReview = async () => {
  await screen.findByText('View users');
  await userEvent.click(toggle('View users', 'Initiator'));
  await userEvent.click(screen.getByRole('button', { name: 'Review and save' }));
  return screen.findByRole('dialog', { name: 'Review permission changes' });
};

describe('US-ADM01-016 review and save (J01 to J03 and supporting)', () => {
  beforeEach(() => {
    for (const m of [getMatrix, reviewChanges, saveChanges]) vi.mocked(m).mockReset();
    vi.mocked(getMatrix).mockResolvedValue(matrix);
    vi.mocked(reviewChanges).mockResolvedValue(review([row()]));
    vi.mocked(saveChanges).mockResolvedValue({ saved: 1, auditId: 'a-1', matrixVersion: 'v-2' });
  });

  /**
   * @tc        TC-ADM01-016-J01
   * @story     US-ADM01-016
   * @ac        AC-US016-01
   * @subtask   ST-ADM01-016-FE-03
   * In plain words: Review and save lists each change with before, after and users affected; Save without a reason is refused with "Enter a reason"; with a reason and an approval reference the save call carries both and the matrix version.
   */
  it('J01 lists the changes and needs a reason', async () => {
    renderPage();
    const dialog = await openReview();
    expect(reviewChanges).toHaveBeenCalledWith([{ roleId: 'r1', permissionKey: 'users.view', allowed: true, scope: null }]);
    const line = await within(dialog).findByRole('row', { name: /View users/ });
    expect(line).toHaveTextContent('Initiator');
    expect(line).toHaveTextContent('Off');
    expect(line).toHaveTextContent('On');
    expect(line).toHaveTextContent('12');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    expect(within(dialog).getByText('Enter a reason')).toBeInTheDocument();
    expect(saveChanges).not.toHaveBeenCalled();
    await userEvent.type(within(dialog).getByLabelText(/^Reason/), 'Quarterly review');
    await userEvent.type(within(dialog).getByLabelText(/Approval reference/), 'CR-12');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('1 change saved')).toBeInTheDocument();
    expect(saveChanges).toHaveBeenCalledWith({ changes: [{ roleId: 'r1', permissionKey: 'users.view', allowed: true, scope: null }], matrixVersion: 'v-1', reason: 'Quarterly review', approvalReference: 'CR-12' });
  });

  /**
   * @tc        TC-ADM01-016-J02
   * @story     US-ADM01-016
   * @ac        AC-US016-02
   * @subtask   ST-ADM01-016-FE-03
   * In plain words: the server warns about a sensitive right; the banner shows its sentence and Save changes stays disabled until the tick is set; the save then carries confirmSensitive.
   */
  it('J02 shows the warning and needs the tick', async () => {
    vi.mocked(reviewChanges).mockResolvedValue(review([row({ permissionKey: 'users.view', sensitive: true })], ['View users is a sensitive right and is being given to Initiator']));
    renderPage();
    const dialog = await openReview();
    expect(await within(dialog).findByText('View users is a sensitive right and is being given to Initiator')).toBeInTheDocument();
    await userEvent.type(within(dialog).getByLabelText(/^Reason/), 'Needed for the audit team');
    const save = within(dialog).getByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();
    await userEvent.click(within(dialog).getByLabelText('I understand and confirm'));
    expect(save).toBeEnabled();
    await userEvent.click(save);
    expect(await screen.findByText('1 change saved')).toBeInTheDocument();
    expect(saveChanges).toHaveBeenCalledWith(expect.objectContaining({ confirmSensitive: true, reason: 'Needed for the audit team' }));
  });

  /**
   * @tc        TC-ADM01-016-J03
   * @story     US-ADM01-016
   * @ac        AC-US016-03
   * @subtask   ST-ADM01-016-FE-03
   * In plain words: the server refuses a locked cell with 403 LOCKED_CELL; the panel shows the refusal and "Nothing was saved", stays open and the changes are kept.
   */
  it('J03 shows the refusal of a locked cell', async () => {
    vi.mocked(saveChanges).mockRejectedValue(new ApiError(403, 'LOCKED_CELL', 'The cell is locked'));
    renderPage();
    const dialog = await openReview();
    await userEvent.type(within(dialog).getByLabelText(/^Reason/), 'Try');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    expect(await within(dialog).findByText('A protected right cannot be changed. Nothing was saved.')).toBeInTheDocument();
    expect(saveChanges).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog', { name: 'Review permission changes' })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Back to the matrix' }));
    expect(screen.getByTestId('matrix-counter')).toHaveTextContent('1 unsaved change');
  });

  /**
   * @story   US-ADM01-016
   * @ac      AC-US016-01
   * @subtask ST-ADM01-016-FE-03
   * In plain words: supporting test. 409 STALE_MATRIX closes the panel, says another administrator saved first, clears the changes and reads the matrix again.
   */
  it('reloads the matrix after STALE_MATRIX', async () => {
    vi.mocked(saveChanges).mockRejectedValue(new ApiError(409, 'STALE_MATRIX', 'Stale'));
    renderPage();
    const dialog = await openReview();
    await userEvent.type(within(dialog).getByLabelText(/^Reason/), 'Try');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Another administrator saved first. The matrix was reloaded; make your changes again.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('matrix-counter')).not.toBeInTheDocument();
    await vi.waitFor(() => expect(vi.mocked(getMatrix).mock.calls.length).toBeGreaterThanOrEqual(2));
  });

  /**
   * @story   US-ADM01-016
   * @ac      AC-US016-01
   * @subtask ST-ADM01-016-FE-03
   * In plain words: supporting test. Back to the matrix closes the panel and keeps the changes; nothing is saved.
   */
  it('Back keeps the changes', async () => {
    renderPage();
    const dialog = await openReview();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Back to the matrix' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('matrix-counter')).toHaveTextContent('1 unsaved change');
    expect(saveChanges).not.toHaveBeenCalled();
  });

  /**
   * @story   US-ADM01-016
   * @ac      AC-US016-01
   * @subtask ST-ADM01-016-FE-03
   * In plain words: supporting test. After a save the matrix is read again, the counter is gone and the notice shows; Dismiss removes the notice.
   */
  it('reads the matrix again after a save and shows the notice', async () => {
    renderPage();
    const dialog = await openReview();
    await userEvent.type(within(dialog).getByLabelText(/^Reason/), 'Done');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('1 change saved')).toBeInTheDocument();
    expect(screen.queryByTestId('matrix-counter')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await vi.waitFor(() => expect(vi.mocked(getMatrix).mock.calls.length).toBeGreaterThanOrEqual(2));
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('1 change saved')).not.toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-016
   * @ac      AC-US016-01
   * @subtask ST-ADM01-016-FE-03
   * In plain words: supporting test. Rows the server marks as not changed are not listed; when none changed the panel says so and Save changes stays disabled.
   */
  it('does not list rows that did not change', async () => {
    vi.mocked(reviewChanges).mockResolvedValue(review([row({ changed: false })]));
    renderPage();
    const dialog = await openReview();
    expect(await within(dialog).findByText('These changes do not alter any access')).toBeInTheDocument();
    expect(within(dialog).queryByRole('row', { name: /View users/ })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  /**
   * @story   US-ADM01-016
   * @ac      AC-US016-01
   * @subtask ST-ADM01-016-FE-03
   * In plain words: supporting test. More than 200 changes show the message and the review is not called (decision L-104).
   */
  it('stops at more than 200 changes', async () => {
    const many: PermissionMatrixData = {
      ...matrix,
      roles: [matrix.roles[0]],
      groups: [{ module: 'Many', permissions: Array.from({ length: 201 }, (_, i) => ({ key: `many.p${i}`, label: `Permission ${i}`, hint: '', cells: { r1: cell(false) } })) }],
    };
    vi.mocked(getMatrix).mockResolvedValue(many);
    renderPage();
    await screen.findByText('Permission 200');
    for (const sw of screen.getAllByRole('switch', { name: /for Initiator$/ })) fireEvent.click(sw);
    await userEvent.click(screen.getByRole('button', { name: 'Review and save' }));
    expect(await screen.findByText('Review at most 200 changes at a time', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(reviewChanges).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }, 180000);
});
