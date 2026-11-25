/**
 * @file    UserForm.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the user form. In plain words: save, duplicate code, two companies, read-only code, the reporting manager rule.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users/UserForm.test.tsx
 * @lld-synced     v0.28
 * @status         pseudo
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listRoles } from '@/features/roles/services/roles.service';
import { UserForm } from '@/features/users/components/UserForm';
import { getCompanies, getDepartments, getDesignations } from '@/features/users/services/masters.service';
import { createUser, getUser, listUsers, updateUser } from '@/features/users/services/users.service';
import { ApiError } from '@/lib/errors';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/users/new', useSearchParams: () => new URLSearchParams('') }));
vi.mock('@/features/users/services/users.service', () => ({ listUsers: vi.fn(), getUser: vi.fn(), createUser: vi.fn(), updateUser: vi.fn() }));
vi.mock('@/features/users/services/masters.service', () => ({ getDepartments: vi.fn(), getDesignations: vi.fn(), getCompanies: vi.fn() }));
vi.mock('@/features/roles/services/roles.service', () => ({ listRoles: vi.fn() }));

const role = (roleId: string, name: string) => ({ roleId, name, description: '', type: 'STANDARD' as const, userCount: 0, lastChanged: '2026-01-01T00:00:00Z', status: 'ACTIVE' as const });
const renderForm = (code?: string) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><UserForm employeeCode={code} /></QueryClientProvider>);

/** Fills the mandatory fields of an Add form (one company with one role). */
async function fill(over: { code?: string; designation?: string; manager?: string | null } = {}) {
  await screen.findByRole('option', { name: 'Finance' }, { timeout: 5000 });
  await userEvent.type(screen.getByLabelText(/Employee code/), over.code ?? '20001');
  await userEvent.type(screen.getByLabelText(/Full name/), 'New Person');
  await userEvent.type(screen.getByLabelText(/Official e-mail/), 'new.person@example.invalid');
  await userEvent.selectOptions(screen.getByLabelText(/^Department/), 'd1');
  await userEvent.selectOptions(screen.getByLabelText(/^Designation/), over.designation ?? 'g1');
  if (over.manager !== null) await userEvent.selectOptions(screen.getByLabelText(/Reporting manager/), over.manager ?? '10050');
  await userEvent.click(screen.getByLabelText('Local password'));
  await userEvent.selectOptions(screen.getByLabelText('Company', { selector: '#company-0' }), 'IPL');
  await userEvent.click(within(screen.getByRole('group', { name: 'Roles for company 1' })).getByRole('checkbox', { name: 'Initiator' }));
  await userEvent.type(screen.getAllByLabelText(/Valid from/)[0], '2026-12-01');
}

describe('UserForm (J01 to J05)', () => {
  beforeEach(() => {
    push.mockClear();
    for (const m of [createUser, updateUser, getUser]) vi.mocked(m).mockReset();
    vi.mocked(getDepartments).mockResolvedValue([{ id: 'd1', code: 'FIN', name: 'Finance' }]);
    vi.mocked(getDesignations).mockResolvedValue([{ id: 'g1', code: 'MGR', name: 'Manager', isHighest: false }, { id: 'g2', code: 'AGM', name: 'AGM', isHighest: true }]);
    vi.mocked(getCompanies).mockResolvedValue({ items: [{ code: 'IPL', name: 'IPL' }, { code: 'IPLFB', name: 'IPL Fertilisers' }], canViewAll: false });
    vi.mocked(listRoles).mockResolvedValue({ items: [role('r1', 'Initiator'), role('r2', 'Auditor')] });
    vi.mocked(listUsers).mockResolvedValue({ items: [{ employeeCode: '10050', name: 'A Manager', email: 'm@example.invalid', department: null, designation: null, companies: [], signIn: 'SSO', status: 'ACTIVE', lastSignIn: null }], counts: { all: 1, active: 1, inactive: 0, locked: 0 }, page: 1, pageSize: 100, total: 1 });
  });

  /**
   * @tc        TC-ADM01-004-J01
   * @story     US-ADM01-004
   * @ac        AC-US004-01
   * @subtask   ST-ADM01-004-FE-03
   * In plain words: with every mandatory field the create call is sent with an Idempotency-Key and the list is opened with the code and the one-time password result in the address.
   */
  it('J01 sends the create call', async () => {
    vi.mocked(createUser).mockResolvedValue({ employeeCode: '20001', status: 'ACTIVE', oneTimePassword: { required: true, emailStatus: 'SENT' } });
    renderForm();
    await fill();
    await userEvent.click(screen.getByTestId('user-save-button'));
    await waitFor(() => expect(createUser).toHaveBeenCalled());
    const [input, key] = vi.mocked(createUser).mock.calls[0];
    expect(input).toMatchObject({ employeeCode: '20001', fullName: 'New Person', email: 'new.person@example.invalid', departmentId: 'd1', designationId: 'g1', reportingManagerCode: '10050', signIn: 'LOCAL', companies: [{ companyCode: 'IPL', roleIds: ['r1'], validFrom: '2026-12-01' }] });
    expect(key).toMatch(/\S{8,}/);
    await waitFor(() => expect(push).toHaveBeenCalledWith('/users?created=20001&otp=SENT'));
  });

  /**
   * @tc        TC-ADM01-004-J02
   * @story     US-ADM01-004
   * @ac        AC-US004-02
   * @subtask   ST-ADM01-004-FE-03
   * In plain words: a 409 DUPLICATE_EMPLOYEE_CODE shows the message on the code field and keeps the other values; the same Idempotency-Key is used on the retry.
   */
  it('J02 shows the duplicate-code message', async () => {
    vi.mocked(createUser).mockRejectedValue(new ApiError(409, 'DUPLICATE_EMPLOYEE_CODE', 'Used'));
    renderForm();
    await fill();
    await userEvent.click(screen.getByTestId('user-save-button'));
    expect(await screen.findByText('This employee code is already used')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full name/)).toHaveValue('New Person');
    expect(push).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId('user-save-button'));
    await waitFor(() => expect(createUser).toHaveBeenCalledTimes(2));
    expect(vi.mocked(createUser).mock.calls[1][1]).toBe(vi.mocked(createUser).mock.calls[0][1]);
  });

  /**
   * @tc        TC-ADM01-004-J03
   * @story     US-ADM01-004
   * @ac        AC-US004-03
   * @subtask   ST-ADM01-004-FE-03
   * In plain words: two company rows with different roles are sent as two companies; the access summary names both.
   */
  it('J03 sends two company rows', async () => {
    vi.mocked(createUser).mockResolvedValue({ employeeCode: '20001', status: 'ACTIVE', oneTimePassword: { required: true, emailStatus: 'SENT' } });
    renderForm();
    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Add company' }));
    await userEvent.selectOptions(screen.getByLabelText('Company', { selector: '#company-1' }), 'IPLFB');
    await userEvent.click(within(screen.getByRole('group', { name: 'Roles for company 2' })).getByRole('checkbox', { name: 'Auditor' }));
    await userEvent.type(screen.getAllByLabelText(/Valid from/)[1], '2026-12-02');
    expect(screen.getByTestId('user-access-summary')).toHaveTextContent('IPL: Initiator');
    expect(screen.getByTestId('user-access-summary')).toHaveTextContent('IPLFB: Auditor');
    await userEvent.click(screen.getByTestId('user-save-button'));
    await waitFor(() => expect(createUser).toHaveBeenCalled());
    expect(vi.mocked(createUser).mock.calls[0][0].companies).toEqual([
      { companyCode: 'IPL', roleIds: ['r1'], validFrom: '2026-12-01' },
      { companyCode: 'IPLFB', roleIds: ['r2'], validFrom: '2026-12-02' },
    ]);
  });

  /**
   * @tc        TC-ADM01-004-J04
   * @story     US-ADM01-004
   * @ac        AC-US004-04
   * @subtask   ST-ADM01-004-FE-03
   * In plain words: in Edit the employee code is read-only for a user who has signed in and editable for one who has not.
   */
  it('J04 makes the code read-only after the first sign-in', async () => {
    const details = (firstSignInAt: string | null) => ({ employeeCode: '30001', name: 'Old Name', email: 'old@example.invalid', department: 'Finance', designation: 'Manager', companies: [{ code: 'IPL', roles: ['Initiator'] }], signIn: 'SSO' as const, status: 'ACTIVE' as const, lastSignIn: null, firstSignInAt, signInLocked: false, summaryText: '', activity: [], form: { mobile: null, departmentId: 'd1', designationId: 'g1', reportingManagerCode: '10050', companies: [{ companyCode: 'IPL', roleIds: ['r1'], validFrom: '2026-01-01', validTo: null }] } });
    vi.mocked(getUser).mockResolvedValue(details('2026-05-01T08:00:00Z'));
    const signed = renderForm('30001');
    expect(await screen.findByDisplayValue('Old Name')).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee code/)).toHaveAttribute('readonly');
    signed.unmount();
    vi.mocked(getUser).mockResolvedValue(details(null));
    renderForm('30001');
    expect(await screen.findByDisplayValue('Old Name')).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee code/)).not.toHaveAttribute('readonly');
    await userEvent.clear(screen.getByLabelText(/Employee code/));
    await userEvent.type(screen.getByLabelText(/Employee code/), '30009');
    vi.mocked(updateUser).mockResolvedValue({} as never);
    await userEvent.click(screen.getByTestId('user-save-button'));
    await waitFor(() => expect(updateUser).toHaveBeenCalled());
    expect(vi.mocked(updateUser).mock.calls[0][0]).toBe('30001');
    expect(vi.mocked(updateUser).mock.calls[0][1]).toMatchObject({ newEmployeeCode: '30009', fullName: 'Old Name' });
  });

  /**
   * @tc        TC-ADM01-004-J05
   * @story     US-ADM01-004
   * @ac        AC-US004-05
   * @subtask   ST-ADM01-004-FE-03
   * In plain words: the highest designation saves without a reporting manager; another designation shows "Choose a reporting manager" and sends nothing.
   */
  it('J05 applies the reporting manager rule', async () => {
    renderForm();
    await fill({ manager: null });
    await userEvent.click(screen.getByTestId('user-save-button'));
    expect(await screen.findByText('Choose a reporting manager')).toBeInTheDocument();
    expect(createUser).not.toHaveBeenCalled();
    vi.mocked(createUser).mockResolvedValue({ employeeCode: '20001', status: 'ACTIVE', oneTimePassword: { required: true, emailStatus: 'SENT' } });
    await userEvent.selectOptions(screen.getByLabelText(/^Designation/), 'g2');
    await userEvent.click(screen.getByTestId('user-save-button'));
    await waitFor(() => expect(createUser).toHaveBeenCalled());
    expect(vi.mocked(createUser).mock.calls[0][0].reportingManagerCode ?? null).toBeNull();
  });
});
