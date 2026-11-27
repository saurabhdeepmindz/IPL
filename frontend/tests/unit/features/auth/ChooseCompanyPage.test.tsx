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
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/unit/features/auth/ChooseCompanyPage.test.tsx
 * @lld-synced     v0.3
 * @status         elaborated
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMe, useSelectContext } from '@/features/auth/hooks/useMe';
import { getMe, selectContext } from '@/features/auth/services/me.service';
import { api } from '@/lib/api-client';
import { ApiError } from '@/lib/errors';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token';
import { useSessionStore } from '@/store/session.store';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn() }), usePathname: () => '/choose-work' }));

const profile = {
  employeeCode: '10002',
  name: 'A. Kumar',
  companies: [{ code: '1000', name: 'Indian Potash Limited', roles: ['Administrator'] }],
  financialYears: [{ label: '2026-27', current: true }, { label: '2025-26', current: false }, { label: '2024-25', current: false }],
  context: null,
  helpdesk: { phone: '1', email: 'it@ipl.example', hours: 'x', placeholder: false },
};
const chosen = { context: { companyCode: '1000', financialYear: '2026-27' }, landing: { role: 'ADMINISTRATOR', route: '/dashboard' }, accessToken: 'new-token', expiresIn: 900 };

const client = () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
function wrapperOf(qc: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe('User chooses company and financial year (US-LGN03-003)', () => {
  beforeEach(() => {
    push.mockClear();
    setAccessToken('first-token');
    useSessionStore.setState({ status: 'signedIn', user: { userId: '', employeeCode: '10002', name: 'A. Kumar', companyCode: '' }, landing: null });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  /** @tc TC-LGN03-003-J01 @story US-LGN03-003 @ac AC-US-LGN03-003-01 @subtask ST-LGN03-003-FE-02 In plain words: page case, written with the page (ST-LGN03-003-FE-02). */
  it.todo('TC-LGN03-003-J01 Given several companies, when the page opens, then they are listed with the roles as a single choice; with one company it is preselected.');

  /** @tc TC-LGN03-003-J02 @story US-LGN03-003 @ac AC-US-LGN03-003-02 @subtask ST-LGN03-003-FE-02 In plain words: page case, written with the page (ST-LGN03-003-FE-02). */
  it.todo('TC-LGN03-003-J02 Given the page, when it opens, then the current financial year is selected and can be changed.');

  /** @tc TC-LGN03-003-J03 @story US-LGN03-003 @ac AC-US-LGN03-003-03 @subtask ST-LGN03-003-FE-01 In plain words: a choice calls PUT /me/context with the company and the year, keeps the new token in memory, stores company, year and landing in the session store and opens the landing page. */
  it('TC-LGN03-003-J03 a choice calls API-ME-02, keeps the new token and opens the landing page', async () => {
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
    expect(push).toHaveBeenCalledWith('/dashboard');
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
});
