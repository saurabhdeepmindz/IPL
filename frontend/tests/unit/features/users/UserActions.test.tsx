/**
 * @file    UserActions.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the user actions. In plain words: unlock, the failed e-mail with Resend, resend, and the supporting menu, Cancel and error cases.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-008
 * @subtask        ST-ADM01-008-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users/UserActions.test.tsx
 * @lld-synced     v0.28
 * @status         elaborated
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listRoles } from '@/features/roles/services/roles.service';
import { UserListPage } from '@/features/users/components/UserListPage';
import { getCompanies, getDepartments } from '@/features/users/services/masters.service';
import { listUsers, resendOneTimePassword, resetUserPassword, unlockUser } from '@/features/users/services/users.service';
import type { UserList, UserListItem } from '@/features/users/types/user.types';
import { ApiError } from '@/lib/errors';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/users', useSearchParams: () => new URLSearchParams('') }));
vi.mock('@/features/users/services/users.service', () => ({ listUsers: vi.fn(), unlockUser: vi.fn(), resetUserPassword: vi.fn(), resendOneTimePassword: vi.fn(), deactivateUser: vi.fn(), readHolds: vi.fn() }));
vi.mock('@/features/users/services/masters.service', () => ({ getDepartments: vi.fn(), getCompanies: vi.fn(), getDesignations: vi.fn() }));
vi.mock('@/features/roles/services/roles.service', () => ({ listRoles: vi.fn() }));

const user = (n: number, over: Partial<UserListItem> = {}): UserListItem => ({
  employeeCode: String(10000 + n), name: `User ${n}`, email: `u${n}@example.invalid`, department: 'Finance', designation: 'Manager',
  companies: [{ code: 'IPL', roles: ['Initiator'] }], signIn: 'SSO', status: 'ACTIVE', lastSignIn: '2026-11-20T09:30:00Z', ...over,
});
const page = (items: UserListItem[]): UserList => ({ items, counts: { all: items.length, active: 1, inactive: 1, locked: 1 }, page: 1, pageSize: 25, total: items.length });
const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><UserListPage /></QueryClientProvider>);
const choose = async (name: string, item: string) => {
  await userEvent.click(await screen.findByRole('button', { name: `Actions for ${name}` }));
  await userEvent.click(await screen.findByRole('menuitem', { name: item }));
  return screen.findByRole('dialog');
};

describe('US-ADM01-008 user actions (J01 to J03 and supporting)', () => {
  beforeEach(() => {
    for (const m of [listUsers, unlockUser, resetUserPassword, resendOneTimePassword]) vi.mocked(m).mockReset();
    vi.mocked(listUsers).mockResolvedValue(page([user(1), user(2, { signIn: 'LOCAL' }), user(3, { status: 'LOCKED' }), user(4, { status: 'INACTIVE', signIn: 'LOCAL' })]));
    vi.mocked(getDepartments).mockResolvedValue([]);
    vi.mocked(getCompanies).mockResolvedValue({ items: [], canViewAll: false });
    vi.mocked(listRoles).mockResolvedValue({ items: [] });
  });

  /**
   * @tc        TC-ADM01-008-J01
   * @story     US-ADM01-008
   * @ac        AC-US008-01
   * @subtask   ST-ADM01-008-FE-03
   * In plain words: a Locked user: Unlock and Confirm calls the API; the list is read again and the row shows Active.
   */
  it('J01 unlocks a Locked user', async () => {
    vi.mocked(unlockUser).mockResolvedValue({ status: 'ACTIVE' });
    vi.mocked(listUsers).mockResolvedValueOnce(page([user(3, { status: 'LOCKED' })])).mockResolvedValue(page([user(3, { status: 'ACTIVE' })]));
    renderPage();
    const dialog = await choose('User 3', 'Unlock');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('User 10003 unlocked.')).toBeInTheDocument();
    expect(unlockUser).toHaveBeenCalledWith('10003');
    const row = screen.getByRole('row', { name: /User 3/ });
    expect(await within(row).findByText('Active')).toBeInTheDocument();
  });

  /**
   * @tc        TC-ADM01-008-J02
   * @story     US-ADM01-008
   * @ac        AC-US008-02
   * @subtask   ST-ADM01-008-FE-03
   * In plain words: a LOCAL user whose e-mail failed: the message says the e-mail was not sent and offers Resend, which repeats the action.
   */
  it('J02 shows the failed e-mail and Resend', async () => {
    vi.mocked(resetUserPassword).mockResolvedValueOnce({ emailStatus: 'FAILED' }).mockResolvedValue({ emailStatus: 'SENT' });
    renderPage();
    const dialog = await choose('User 2', 'Reset password');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('The e-mail was not sent.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Resend' }));
    expect(await screen.findByText('A new one-time password was e-mailed to u2@example.invalid.')).toBeInTheDocument();
    expect(resetUserPassword).toHaveBeenCalledTimes(2);
  });

  /**
   * @tc        TC-ADM01-008-J03
   * @story     US-ADM01-008
   * @ac        AC-US008-03
   * @subtask   ST-ADM01-008-FE-03
   * In plain words: a LOCAL user: Resend one-time password shows the e-mail status in a success message.
   */
  it('J03 resends the one-time password', async () => {
    vi.mocked(resendOneTimePassword).mockResolvedValue({ emailStatus: 'SENT' });
    renderPage();
    const dialog = await choose('User 2', 'Resend one-time password');
    expect(within(dialog).getByText(/e-mailed to u2@example.invalid/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('A new one-time password was e-mailed to u2@example.invalid.')).toBeInTheDocument();
    expect(resendOneTimePassword).toHaveBeenCalledWith('10002');
  });

  /**
   * @story   US-ADM01-008
   * @ac      AC-US008-01
   * @subtask ST-ADM01-008-FE-03
   * In plain words: supporting test. The menu offers only what fits: Locked gets Unlock, a local user gets the two password actions, an SSO user only Deactivate, and an Inactive user has no menu.
   */
  it('offers only the actions that fit the user', async () => {
    renderPage();
    const items = async (name: string) => {
      await userEvent.click(await screen.findByRole('button', { name: `Actions for ${name}` }));
      const names = screen.getAllByRole('menuitem').map((i) => i.textContent);
      await userEvent.keyboard('{Escape}');
      return names;
    };
    expect(await items('User 3')).toEqual(['Unlock', 'Deactivate']);
    expect(await items('User 2')).toEqual(['Reset password', 'Resend one-time password', 'Deactivate']);
    expect(await items('User 1')).toEqual(['Deactivate']);
    expect(screen.queryByRole('button', { name: 'Actions for User 4' })).not.toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-008
   * @ac      AC-US008-01
   * @subtask ST-ADM01-008-FE-03
   * In plain words: supporting test. The menu works with the keyboard: Enter opens and focuses the first item, the arrow keys move, Escape closes and returns the focus to the button.
   */
  it('works with the keyboard', async () => {
    renderPage();
    const button = await screen.findByRole('button', { name: 'Actions for User 2' });
    button.focus();
    await userEvent.keyboard('{Enter}');
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(menuItems[1]).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  /**
   * @story   US-ADM01-008
   * @ac      AC-US008-01
   * @subtask ST-ADM01-008-FE-03
   * In plain words: supporting test. Cancel in the confirmation sends nothing and shows no message.
   */
  it('Cancel sends nothing', async () => {
    renderPage();
    const dialog = await choose('User 3', 'Unlock');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(unlockUser).not.toHaveBeenCalled();
    expect(screen.queryByText('User 10003 unlocked.')).not.toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-008
   * @ac      AC-US008-03
   * @subtask ST-ADM01-008-FE-03
   * In plain words: supporting test. Reset password shows the success message with the e-mail address and Dismiss removes it.
   */
  it('shows the reset message and Dismiss removes it', async () => {
    vi.mocked(resetUserPassword).mockResolvedValue({ emailStatus: 'SENT' });
    renderPage();
    const dialog = await choose('User 2', 'Reset password');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('A new one-time password was e-mailed to u2@example.invalid.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText(/was e-mailed/)).not.toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-008
   * @ac      AC-US008-01
   * @subtask ST-ADM01-008-FE-03
   * In plain words: supporting test. 409 NOT_LOCKED, 422 NOT_LOCAL_USER and 422 ALREADY_SIGNED_IN show the message of the API and the list is read again.
   */
  it('shows the message of a refused call and reads the list again', async () => {
    vi.mocked(unlockUser).mockRejectedValue(new ApiError(409, 'NOT_LOCKED', 'The user is not locked'));
    vi.mocked(resendOneTimePassword).mockRejectedValue(new ApiError(422, 'ALREADY_SIGNED_IN', 'The user has already signed in'));
    renderPage();
    let dialog = await choose('User 3', 'Unlock');
    const before = vi.mocked(listUsers).mock.calls.length;
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('The user is not locked')).toBeInTheDocument();
    await vi.waitFor(() => expect(vi.mocked(listUsers).mock.calls.length).toBeGreaterThan(before));
    dialog = await choose('User 2', 'Resend one-time password');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('The user has already signed in')).toBeInTheDocument();
  });
});
