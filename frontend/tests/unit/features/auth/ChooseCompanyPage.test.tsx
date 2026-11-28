/**
 * @file    ChooseCompanyPage.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of the company and financial year choice (US-LGN03-003). In plain words: the profile call and the choice call are made against the AMS API, the new access token is kept in memory, the session store holds the company, the year and the landing page, and the browser goes to the landing page. The page cases (J01, J02) are named todos until the page is built (ST-LGN03-003-FE-02).
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-003
 * @subtask        ST-LGN03-003-FE-01
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/unit/features/auth/ChooseCompanyPage.test.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChooseCompanyPage } from '@/features/auth/components/ChooseCompanyPage';
import { useMe, useSelectContext } from '@/features/auth/hooks/useMe';
import { readContext } from '@/features/auth/utils/rememberChoices';
import { authHttp } from '@/features/auth/services/auth.service';
import { getMe, selectContext } from '@/features/auth/services/me.service';
import { api } from '@/lib/api-client';
import { ApiError } from '@/lib/errors';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token';
import { useSessionStore } from '@/store/session.store';

const push = vi.fn();
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }), usePathname: () => '/choose-work' }));

const profile = {
  employeeCode: '10002',
  name: 'A. Kumar',
  companies: [{ code: '1000', name: 'Indian Potash Limited', roles: ['Administrator'] }],
  financialYears: [{ label: '2026-27', current: true }, { label: '2025-26', current: false }, { label: '2024-25', current: false }],
  context: null,
  helpdesk: { phone: '1', email: 'it@ipl.example', hours: 'x', placeholder: false },
};
const TWO = { ...profile, companies: [{ code: '1000', name: 'Indian Potash Limited', roles: ['Administrator'] }, { code: '2000', name: 'IPL Subsidiary (illustrative)', roles: ['Initiator', 'Processor'] }] };
const config = { data: { data: { ssoAvailable: true, idpMode: 'saml', helpdesk: { phone: '1', email: 'it@ipl.example', hours: 'x', placeholder: false } } } };
const chosen = { context: { companyCode: '1000', financialYear: '2026-27' }, landing: { role: 'ADMINISTRATOR', route: '/dashboard' }, accessToken: 'new-token', expiresIn: 900 };

const client = () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
const wrapperOf = (qc: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) { return <QueryClientProvider client={qc}>{children}</QueryClientProvider>; };

describe('User chooses company and financial year (US-LGN03-003)', () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    vi.spyOn(authHttp, 'get').mockResolvedValue(config);
    localStorage.clear();
    setAccessToken('first-token');
    useSessionStore.setState({ status: 'signedIn', user: { userId: '', employeeCode: '10002', name: 'A. Kumar', companyCode: '' }, landing: null });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  /** @tc TC-LGN03-003-J01 @story US-LGN03-003 @ac AC-US-LGN03-003-01 @subtask ST-LGN03-003-FE-02 In plain words: several companies start on "Select a company" and each is listed with its code; the roles of the chosen company show in a box; with one company it is preselected. */
  it('TC-LGN03-003-J01 several companies are listed for a single choice with the roles; one company is preselected', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: TWO } });
    const user = userEvent.setup();
    const first = render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    const select = (await screen.findByTestId('choose-co')) as HTMLSelectElement;
    expect([...select.options].map((o) => o.textContent)).toEqual(['Select a company', 'Indian Potash Limited · 1000', 'IPL Subsidiary (illustrative) · 2000']);
    expect(select.value).toBe('');
    expect(screen.queryByTestId('choose-roles')).toBeNull();
    expect(screen.getByText('You have access to 2 companies. You work in one company at a time.')).toBeInTheDocument();
    await user.selectOptions(select, '2000');
    expect(within(screen.getByTestId('choose-roles')).getByText('Your roles in IPL Subsidiary (illustrative)')).toBeInTheDocument();
    expect(screen.getByTestId('choose-roles')).toHaveTextContent('Initiator, Processor');
    first.unmount();
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: profile } });
    render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    const one = (await screen.findByTestId('choose-co')) as HTMLSelectElement;
    expect([...one.options].map((o) => o.textContent)).toEqual(['Indian Potash Limited · 1000']);
    expect(one.value).toBe('1000');
    expect(screen.getByText('You have access to one company.')).toBeInTheDocument();
    expect(screen.getByTestId('choose-roles')).toHaveTextContent('Administrator');
  });

  /** @tc TC-LGN03-003-J02 @story US-LGN03-003 @ac AC-US-LGN03-003-02 @subtask ST-LGN03-003-FE-02 In plain words: the current financial year is selected when the page opens and the user can change it. */
  it('TC-LGN03-003-J02 the current financial year is selected and can be changed', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: profile } });
    const user = userEvent.setup();
    render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    const year = (await screen.findByTestId('choose-fy')) as HTMLSelectElement;
    expect([...year.options].map((o) => o.textContent)).toEqual(['2026-27 (current)', '2025-26', '2024-25']);
    expect(year.value).toBe('2026-27');
    await user.selectOptions(year, '2025-26');
    expect(year.value).toBe('2025-26');
  });

  /** @story US-LGN03-003 @ac AC-US-LGN03-003-03 @subtask ST-LGN03-003-FE-02 In plain words: supporting test. Continue with a chosen company and year calls the choice; Continue with no company chosen shows what is missing and calls nothing. */
  it('continues with the choice, and asks for a company first when none is chosen', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: TWO } });
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: { data: chosen } });
    const user = userEvent.setup();
    render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    await screen.findByTestId('choose-co');
    await user.click(screen.getByTestId('choose-go'));
    expect(await screen.findByTestId('choose-error')).toHaveTextContent('Choose a company');
    expect(put).not.toHaveBeenCalled();
    await user.selectOptions(screen.getByTestId('choose-co'), '1000');
    await user.selectOptions(screen.getByTestId('choose-fy'), '2025-26');
    await user.click(screen.getByTestId('choose-go'));
    await waitFor(() => expect(put).toHaveBeenCalledWith('/me/context', { companyCode: '1000', financialYear: '2025-26' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/landing/opening'));
  });

  /** @story US-LGN03-003 @ac AC-US-LGN03-003-03 @subtask ST-LGN03-003-FE-02 In plain words: supporting test. A refused choice (403) shows a plain message, keeps the form and reloads the list. */
  it('shows a plain message and reloads the list when the choice is refused', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: { data: profile } });
    vi.spyOn(api, 'put').mockRejectedValue(Object.assign(new Error('x'), { isAxiosError: true, response: { status: 403, data: { error: { code: 'COMPANY_NOT_ALLOWED', message: 'You do not have access to this company.', fields: [] } } } }));
    const user = userEvent.setup();
    render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    await screen.findByTestId('choose-co');
    await user.click(screen.getByTestId('choose-go'));
    expect(await screen.findByTestId('choose-error')).toHaveTextContent('You do not have access to this company');
    await waitFor(() => expect(get.mock.calls.length).toBeGreaterThan(1));
    expect(push).not.toHaveBeenCalled();
  });

  /** @story US-LGN03-004 @ac AC-US-LGN03-004-01 @subtask ST-LGN03-003-FE-02 In plain words: supporting test. A user with no company is sent to the no-access page. */
  it('sends a user with no company to the no-access page', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: { ...profile, companies: [] } } });
    render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/no-company-access'));
  });

  /** @story US-LGN03-003 @ac AC-US-LGN03-003-01 @subtask ST-LGN03-003-FE-02 In plain words: supporting test. The page shows the name and employee code and the sign-out link, and the tick box "Start with this company and year next time" is ticked (UX-LGN-16). */
  it('shows who is signed in and a ticked next-time box', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: profile } });
    render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    expect(await screen.findByText('A. Kumar')).toBeInTheDocument();
    expect(screen.getByText('Employee code 10002')).toBeInTheDocument();
    expect(screen.getByText('Not you? Sign out')).toBeInTheDocument();
    expect(screen.getByTestId('choose-rem')).toBeChecked();
  });

  /** @tc TC-LGN03-003-J03 @story US-LGN03-003 @ac AC-US-LGN03-003-03 @subtask ST-LGN03-003-FE-01 In plain words: a choice calls PUT /me/context with the company and the year, keeps the new token in memory, stores company, year and landing in the session store and opens the Opening page (which then opens the landing page). */
  it('TC-LGN03-003-J03 a choice calls API-ME-02, keeps the new token and opens the Opening page', async () => {
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: { data: chosen } });
    const qc = client();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useSelectContext(), { wrapper: wrapperOf(qc) });
    result.current.mutate({ companyCode: '1000', financialYear: '2026-27' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(put).toHaveBeenCalledWith('/me/context', { companyCode: '1000', financialYear: '2026-27' });
    expect(getAccessToken()).toBe('new-token');
    expect(useSessionStore.getState().user).toMatchObject({ companyCode: '1000', financialYear: '2026-27' });
    expect(useSessionStore.getState().landing).toEqual({ role: 'ADMINISTRATOR', route: '/dashboard' });
    expect(invalidate).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/landing/opening');
  });

  /** @story US-LGN03-003 @ac AC-US-LGN03-003-01 @subtask ST-LGN03-003-FE-01 In plain words: supporting test. The profile call reads GET /me and gives the data part; the hook gives the same data. */
  it('reads the profile with GET /me', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: { data: profile } });
    await expect(getMe()).resolves.toEqual(profile);
    expect(get).toHaveBeenCalledWith('/me');
    const { result } = renderHook(() => useMe(), { wrapper: wrapperOf(client()) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.companies[0].code).toBe('1000');
  });

  /** @story US-LGN03-003 @ac AC-US-LGN03-003-03 @subtask ST-LGN03-003-FE-01 In plain words: supporting test. A refused choice (403 COMPANY_NOT_ALLOWED) comes back as a plain error, keeps the old token and goes nowhere. */
  it('keeps the old token and stays when the choice is refused', async () => {
    const refusal = Object.assign(new Error('x'), { isAxiosError: true, response: { status: 403, data: { error: { code: 'COMPANY_NOT_ALLOWED', message: 'You do not have access to this company.', fields: [] } } } });
    vi.spyOn(api, 'put').mockRejectedValue(refusal);
    await expect(selectContext({ companyCode: 'X', financialYear: '2026-27' })).rejects.toBeInstanceOf(ApiError);
    const { result } = renderHook(() => useSelectContext(), { wrapper: wrapperOf(client()) });
    result.current.mutate({ companyCode: 'X', financialYear: '2026-27' });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as ApiError).code).toBe('COMPANY_NOT_ALLOWED');
    expect(getAccessToken()).toBe('first-token');
    expect(push).not.toHaveBeenCalled();
  });

  /** @story US-LGN03-003 @ac AC-US-LGN03-003-01 @subtask ST-LGN03-003-FE-01 In plain words: supporting test. A failed profile call comes back as a plain error, not a raw one. */
  it('turns a failed profile call into a plain error', async () => {
    vi.spyOn(api, 'get').mockRejectedValue(Object.assign(new Error('x'), { isAxiosError: true, response: { status: 500, data: { error: { code: 'SERVER_ERROR', message: 'Something went wrong', fields: [] } } } }));
    await expect(getMe()).rejects.toBeInstanceOf(ApiError);
  });

  /** @story US-LGN03-006 @ac AC-US-LGN03-006-01 @subtask ST-LGN03-006-FE-02 In plain words: supporting test (US-LGN03-006). When the user ticked "Start with this company and year next time" and the remembered company and year are still allowed, the page is skipped: the choice is saved at once and the Opening page opens, with no click. */
  it('skips the page when the remembered company and year are still allowed', async () => {
    localStorage.setItem('ams.context', JSON.stringify({ companyCode: '2000', financialYear: '2025-26' }));
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: TWO } });
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: { data: chosen } });
    render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    await waitFor(() => expect(put).toHaveBeenCalledWith('/me/context', { companyCode: '2000', financialYear: '2025-26' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/landing/opening'));
  });

  /** @story US-LGN03-006 @ac AC-US-LGN03-006-01 @subtask ST-LGN03-006-FE-02 In plain words: supporting test. A remembered company the user no longer has (or a year that is no longer in the list) is not used and is forgotten; the page opens as usual. */
  it('ignores and forgets a remembered choice that is no longer allowed', async () => {
    localStorage.setItem('ams.context', JSON.stringify({ companyCode: '9999', financialYear: '2026-27' }));
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: TWO } });
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: { data: chosen } });
    render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    const select = (await screen.findByTestId('choose-co')) as HTMLSelectElement;
    expect(select.value).toBe('');
    expect(put).not.toHaveBeenCalled();
    await waitFor(() => expect(readContext()).toBeNull());
  });

  /** @story US-LGN03-006 @ac AC-US-LGN03-006-01 @subtask ST-LGN03-006-FE-02 In plain words: supporting test. A remembered company that is allowed but a year that is not in the list is not used either. */
  it('ignores a remembered year that is no longer in the list', async () => {
    localStorage.setItem('ams.context', JSON.stringify({ companyCode: '1000', financialYear: '1999-00' }));
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: TWO } });
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: { data: chosen } });
    render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    expect(((await screen.findByTestId('choose-co')) as HTMLSelectElement).value).toBe('');
    expect(put).not.toHaveBeenCalled();
    await waitFor(() => expect(readContext()).toBeNull());
  });

  /** @story US-LGN03-006 @ac AC-US-LGN03-006-01 @subtask ST-LGN03-006-FE-02 In plain words: supporting test. Continue with the box ticked remembers the company and year; with the box unticked it forgets them. */
  it('remembers the choice when the box is ticked and forgets it when it is not', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: TWO } });
    vi.spyOn(api, 'put').mockResolvedValue({ data: { data: chosen } });
    const user = userEvent.setup();
    const first = render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    await screen.findByTestId('choose-co');
    await user.selectOptions(screen.getByTestId('choose-co'), '1000');
    await user.click(screen.getByTestId('choose-go'));
    await waitFor(() => expect(readContext()).toEqual({ companyCode: '1000', financialYear: '2026-27' }));
    first.unmount();
    localStorage.removeItem('ams.context');
    render(<ChooseCompanyPage />, { wrapper: wrapperOf(client()) });
    await screen.findByTestId('choose-co');
    await user.selectOptions(screen.getByTestId('choose-co'), '1000');
    await user.click(screen.getByTestId('choose-rem'));
    await user.click(screen.getByTestId('choose-go'));
    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(readContext()).toBeNull();
  });
});
