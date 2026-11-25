/**
 * @file    UserDetail.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the details page. In plain words: deactivate with a reason; the proposals warning; the tabs, Cancel, 422, 404 and the hidden button for an Inactive user.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-006
 * @subtask        ST-ADM01-006-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users/UserDetail.test.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserDetailPage } from '@/features/users/components/UserDetailPage';
import type * as UsersService from '@/features/users/services/users.service';
import { deactivateUser, getUser } from '@/features/users/services/users.service';
import type { UserDetails } from '@/features/users/types/user.types';
import { ApiError } from '@/lib/errors';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/users/20001', useSearchParams: () => new URLSearchParams('') }));
vi.mock('@/features/users/services/users.service', async (original) => ({ ...(await original<typeof UsersService>()), getUser: vi.fn(), deactivateUser: vi.fn() }));

const user = (over: Partial<UserDetails> = {}): UserDetails => ({
  employeeCode: '20001',
  name: 'Anil Kumar',
  email: 'anil@example.invalid',
  department: 'Information Technology',
  designation: 'Senior Manager',
  companies: [{ code: 'IPL', roles: ['Initiator', 'Auditor'] }],
  signIn: 'SSO',
  status: 'ACTIVE',
  lastSignIn: '2026-11-25T09:31:00Z',
  firstSignInAt: '2026-11-01T08:00:00Z',
  signInLocked: false,
  summaryText: 'Initiator and Auditor in IPL',
  activity: [{ at: '2026-11-20T10:00:00Z', text: 'User created by 10001' }],
  form: { mobile: null, departmentId: 'd1', designationId: 'g1', reportingManagerCode: '10012', companies: [{ companyCode: 'IPL', roleIds: ['r1', 'r2'], validFrom: '2026-01-01', validTo: '2026-12-31' }] },
  ...over,
});
const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <UserDetailPage employeeCode="20001" />
    </QueryClientProvider>,
  );
const openDialog = async () => {
  await userEvent.click(await screen.findByRole('button', { name: 'Deactivate' }));
  return screen.findByRole('dialog');
};

describe('US-ADM01-006 user details (J01, J02 and supporting)', () => {
  beforeEach(() => {
    vi.mocked(getUser).mockReset();
    vi.mocked(deactivateUser).mockReset();
    vi.mocked(getUser).mockResolvedValue(user());
  });

  /**
   * @tc        TC-ADM01-006-J01
   * @story     US-ADM01-006
   * @ac        AC-US006-01
   * @subtask   ST-ADM01-006-FE-03
   * In plain words: an Active user: a reason is chosen and confirmed; the call is sent, the status shows Inactive and the Deactivate button is gone.
   */
  it('J01 deactivates with a reason', async () => {
    vi.mocked(getUser).mockResolvedValueOnce(user()).mockResolvedValue(user({ status: 'INACTIVE' }));
    vi.mocked(deactivateUser).mockResolvedValue({ status: 'INACTIVE' });
    renderPage();
    const dialog = await openDialog();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(within(dialog).getByText('Choose a reason')).toBeInTheDocument();
    expect(deactivateUser).not.toHaveBeenCalled();
    await userEvent.selectOptions(within(dialog).getByLabelText(/Reason/), 'LEFT_COMPANY');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('User deactivated')).toBeInTheDocument();
    expect(deactivateUser).toHaveBeenCalledWith('20001', { reason: 'LEFT_COMPANY' });
    expect(await screen.findByText('Inactive')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument();
  });

  /**
   * @tc        TC-ADM01-006-J02
   * @story     US-ADM01-006
   * @ac        AC-US006-02
   * @subtask   ST-ADM01-006-FE-03
   * In plain words: the API answers 409 HOLDS_PROPOSALS with count 7: the dialog shows "7 proposals are waiting with this user", the Workflow Monitor address and Continue; Continue sends the call again with the confirmation.
   */
  it('J02 shows the proposals warning and Continue', async () => {
    vi.mocked(deactivateUser)
      .mockRejectedValueOnce(new ApiError(409, 'HOLDS_PROPOSALS', 'The user holds 7 proposal(s)', { count: '7', workflowMonitorUrl: '/workflow-monitor', hasDelegate: 'false' }))
      .mockResolvedValue({ status: 'INACTIVE' });
    renderPage();
    const dialog = await openDialog();
    await userEvent.selectOptions(within(dialog).getByLabelText(/Reason/), 'TRANSFERRED');
    await userEvent.type(within(dialog).getByLabelText(/Note/), 'Moved to Delhi');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('7 proposals are waiting with this user')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Workflow Monitor/ })).toHaveAttribute('href', '/workflow-monitor');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(deactivateUser).toHaveBeenLastCalledWith('20001', { reason: 'TRANSFERRED', note: 'Moved to Delhi', confirmWithProposals: true });
    expect(await screen.findByText('User deactivated')).toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-006
   * @ac      AC-US006-01
   * @subtask ST-ADM01-006-FE-03
   * In plain words: supporting test. The header has the name, status and an Edit user link to the form; the three tabs show the data of API-USR-03 (the reporting manager as a code, valid from and to, the activity).
   */
  it('shows the header and the three tabs', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Anil Kumar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit user' })).toHaveAttribute('href', '/users/20001/edit');
    expect(screen.getByText('anil@example.invalid')).toBeInTheDocument();
    expect(screen.getAllByText('Information Technology').length).toBeGreaterThan(0);
    expect(screen.getByText('10012')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Companies and roles' }));
    const row = screen.getByRole('row', { name: /IPL/ });
    expect(row).toHaveTextContent('Initiator, Auditor');
    expect(row).toHaveTextContent('2026-01-01');
    expect(row).toHaveTextContent('2026-12-31');
    await userEvent.click(screen.getByRole('tab', { name: 'Activity' }));
    expect(screen.getByText(/User created by 10001/)).toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-006
   * @ac      AC-US006-01
   * @subtask ST-ADM01-006-FE-03
   * In plain words: supporting test. Cancel closes the dialog and sends nothing.
   */
  it('Cancel changes nothing', async () => {
    renderPage();
    const dialog = await openDialog();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(deactivateUser).not.toHaveBeenCalled();
  });

  /**
   * @story   US-ADM01-006
   * @ac      AC-US006-02
   * @subtask ST-ADM01-006-FE-03
   * In plain words: supporting test. 422 LAST_ADMINISTRATOR shows the message of the API; 404 shows a message and a link back to the list.
   */
  it('shows the last-administrator and not-found messages', async () => {
    vi.mocked(deactivateUser).mockRejectedValue(new ApiError(422, 'LAST_ADMINISTRATOR', 'The last Administrator cannot be deactivated'));
    const first = renderPage();
    const dialog = await openDialog();
    await userEvent.selectOptions(within(dialog).getByLabelText(/Reason/), 'OTHER');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('The last Administrator cannot be deactivated')).toBeInTheDocument();
    first.unmount();
    vi.mocked(getUser).mockReset();
    vi.mocked(getUser).mockRejectedValue(new ApiError(404, 'USER_NOT_FOUND', 'No such user'));
    renderPage();
    expect(await screen.findByText('This user was not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the list' })).toHaveAttribute('href', '/users');
  });

  /**
   * @story   US-ADM01-006
   * @ac      AC-US006-01
   * @subtask ST-ADM01-006-FE-03
   * In plain words: supporting test. An Inactive user has no Deactivate button; a Locked user has one and shows the Locked badge (decision L-85).
   */
  it('hides Deactivate for an Inactive user and shows it for a Locked one', async () => {
    vi.mocked(getUser).mockResolvedValue(user({ status: 'INACTIVE' }));
    const first = renderPage();
    expect(await screen.findByText('Inactive')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument();
    first.unmount();
    vi.mocked(getUser).mockResolvedValue(user({ status: 'LOCKED' }));
    renderPage();
    expect(await screen.findByText('Locked')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
  });
});
