/**
 * @file    LandingGate.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of US-LGN03-005 (User lands on the dashboard of their role and can change company from the header). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-005
 * @subtask        ST-LGN03-005-FE-01
 * @lld            LLD-EPIC-LGN-03 v0.3 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/unit/features/auth/LandingGate.test.tsx
 * @lld-synced     v0.3
 * @status         elaborated
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanySwitcher } from '@/components/layout/CompanySwitcher';
import { LandingGate } from '@/features/auth/components/LandingGate';
import { RoleDashboardPlaceholder } from '@/features/auth/components/RoleDashboardPlaceholder';
import { LANDING_ROUTES, NEUTRAL_LANDING, dashboardName, isBuilt } from '@/features/auth/landing.map';
import { authHttp } from '@/features/auth/services/auth.service';
import { api } from '@/lib/api-client';
import { clearAccessToken, setAccessToken } from '@/lib/token';
import { useSessionStore } from '@/store/session.store';

const push = vi.fn();
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }), usePathname: () => '/dashboard' }));

const helpdesk = { phone: '1', email: 'it@ipl.example', hours: 'x', placeholder: false };
const config = { data: { data: { ssoAvailable: true, idpMode: 'saml', helpdesk } } };
const years = [{ label: '2026-27', current: true }, { label: '2025-26', current: false }, { label: '2024-25', current: false }];
const profile = {
  employeeCode: '10002',
  name: 'A. Kumar',
  companies: [
    { code: 'IPL', name: 'Indian Potash Limited', roles: ['Administrator'] },
    { code: 'IPLFB', name: 'IPL second company', roles: ['Auditor'] },
  ],
  financialYears: years,
  context: { companyCode: 'IPL', financialYear: '2026-27' },
  helpdesk,
};
const chosenFb = { context: { companyCode: 'IPLFB', financialYear: '2026-27' }, landing: { role: 'AUDITOR', route: '/landing/reports' }, accessToken: 'tok-fb', expiresIn: 900 };

function client() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}
function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client()}>{children}</QueryClientProvider>;
}
const sessionOf = (companyCode: string, route: string, role: string) =>
  useSessionStore.setState({ status: 'signedIn', user: { userId: '', employeeCode: '10002', name: 'A. Kumar', companyCode, financialYear: '2026-27' }, landing: { role, route } });

describe('User lands on the dashboard of their role and can change company from the header (US-LGN03-005)', () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    setAccessToken('tok');
    sessionOf('IPL', '/dashboard', 'ADMINISTRATOR');
    vi.spyOn(authHttp, 'get').mockResolvedValue(config);
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: profile } });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    clearAccessToken();
  });

  /** @tc TC-LGN03-005-J01 @story US-LGN03-005 @ac AC-US-LGN03-005-01 @subtask ST-LGN03-005-FE-02 In plain words: changing company in the header saves the choice with the same financial year, moves the session store to the other company and opens the Opening page; one company only is active. */
  it('TC-LGN03-005-J01 changing company in the header calls API-ME-02 and moves the session to the other company', async () => {
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: { data: chosenFb } });
    const user = userEvent.setup();
    render(<CompanySwitcher />, { wrapper });
    expect(screen.getByTestId('layout-company')).toHaveTextContent('IPL');
    await user.click(screen.getByTestId('company-switcher'));
    await user.click(await screen.findByTestId('switch-IPLFB'));
    await waitFor(() => expect(put).toHaveBeenCalledWith('/me/context', { companyCode: 'IPLFB', financialYear: '2026-27' }));
    await waitFor(() => expect(useSessionStore.getState().user?.companyCode).toBe('IPLFB'));
    expect(useSessionStore.getState().landing).toEqual({ role: 'AUDITOR', route: '/landing/reports' });
    expect(push).toHaveBeenCalledWith('/landing/opening');
  });

  /** @tc TC-LGN03-005-J02 @story US-LGN03-005 @ac AC-US-LGN03-005-02 @subtask ST-LGN03-005-FE-02 In plain words: the header list holds exactly the companies of the profile (the valid ones), marks the current one, and choosing a company calls the choice again so its landing page reopens. */
  it('TC-LGN03-005-J02 the header list holds only the valid companies and choosing one reopens its landing page', async () => {
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: { data: { ...chosenFb, context: { companyCode: 'IPL', financialYear: '2026-27' }, landing: { role: 'ADMINISTRATOR', route: '/dashboard' } } } });
    const user = userEvent.setup();
    render(<CompanySwitcher />, { wrapper });
    await user.click(screen.getByTestId('company-switcher'));
    const menu = await screen.findByTestId('company-menu');
    const items = within(menu).getAllByRole('menuitem');
    expect(items.map((i) => i.textContent)).toEqual(['Indian Potash Limited · IPL', 'IPL second company · IPLFB']);
    expect(screen.getByTestId('switch-IPL')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByTestId('switch-IPLFB')).not.toHaveAttribute('aria-current');
    await user.click(screen.getByTestId('switch-IPL'));
    await waitFor(() => expect(put).toHaveBeenCalledWith('/me/context', { companyCode: 'IPL', financialYear: '2026-27' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/landing/opening'));
  });

  /** @tc TC-LGN03-005-J03 @story US-LGN03-005 @ac AC-US-LGN03-005-03 @subtask ST-LGN03-005-FE-02 In plain words: the Opening page names the company, the year, the roles and the dashboard of the role, and opens that dashboard after 2.5 seconds; "Go now" opens it at once. */
  it('TC-LGN03-005-J03 the Opening page shows where AMS opens and opens the dashboard of the role', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
    render(<LandingGate />, { wrapper });
    const page = await screen.findByTestId('opening');
    expect(page).toHaveTextContent('Opening your dashboard');
    expect(page).toHaveTextContent('Signed in as A. Kumar');
    expect(page).toHaveTextContent('Indian Potash Limited · IPL');
    expect(page).toHaveTextContent('2026-27');
    expect(page).toHaveTextContent('Administrator');
    expect(page).toHaveTextContent('Admin Dashboard');
    expect(replace).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    expect(replace).toHaveBeenCalledWith('/dashboard');
    replace.mockClear();
    fireEvent.click(screen.getByTestId('opening-go'));
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  /** @tc TC-LGN03-005-J04 @story US-LGN03-005 @ac AC-US-LGN03-005-04 @subtask ST-LGN03-005-FE-02 In plain words: the landing page is the one the AMS API chose by the role order (the order itself is proved on the API); the Opening page shows it, here the Finance Dashboard. */
  it('TC-LGN03-005-J04 the Opening page follows the landing the API chose for several roles', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
    sessionOf('IPL', '/landing/finance', 'FINANCE');
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: { ...profile, companies: [{ code: 'IPL', name: 'Indian Potash Limited', roles: ['Administrator', 'Finance', 'Initiator'] }, profile.companies[1]] } } });
    render(<LandingGate />, { wrapper });
    expect(await screen.findByTestId('opening')).toHaveTextContent('Finance Dashboard');
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    expect(replace).toHaveBeenCalledWith('/landing/finance');
  });

  /** @tc TC-LGN03-005-J05 @story US-LGN03-005 @ac AC-US-LGN03-005-05 @subtask ST-LGN03-005-FE-02 In plain words: an initiator only opens the Initiator Dashboard; an initiator who is also a processor opens the Inbox (the Processor Dashboard). */
  it('TC-LGN03-005-J05 the Opening page shows the Initiator Dashboard, or the Inbox for an initiator who is also a processor', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
    sessionOf('IPL', '/landing/initiator', 'INITIATOR');
    const first = render(<LandingGate />, { wrapper });
    expect(await screen.findByTestId('opening')).toHaveTextContent('Initiator Dashboard');
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    expect(replace).toHaveBeenCalledWith('/landing/initiator');
    first.unmount();
    replace.mockClear();
    sessionOf('IPL', '/landing/inbox', 'PROCESSOR');
    render(<LandingGate />, { wrapper });
    expect(await screen.findByTestId('opening')).toHaveTextContent('Processor Dashboard');
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    expect(replace).toHaveBeenCalledWith('/landing/inbox');
  });

  /** @tc TC-LGN03-005-J06 @story US-LGN03-005 @ac AC-US-LGN03-005-06 @subtask ST-LGN03-005-FE-01 In plain words: only the dashboards of built modules count as built (the Admin Dashboard now); every other landing route is a placeholder page, so no user ever opens an address that leads nowhere. */
  it('TC-LGN03-005-J06 a dashboard that is not built yet is a placeholder page; only the Admin Dashboard is built', () => {
    expect(isBuilt('/dashboard')).toBe(true);
    for (const route of ['/landing/finance', '/landing/initiator', '/landing/inbox', '/landing/reports', NEUTRAL_LANDING]) expect(isBuilt(route)).toBe(false);
    expect(isBuilt('/anything/else')).toBe(false);
  });

  /** @story US-LGN03-005 @ac AC-US-LGN03-005-06 @subtask ST-LGN03-005-FE-01 In plain words: supporting test. The routes of the roles are the ones the AMS API returns, and each has a name for the page. */
  it('keeps the routes of the API and names every dashboard', () => {
    expect(LANDING_ROUTES).toEqual({ ADMINISTRATOR: '/dashboard', FINANCE: '/landing/finance', INITIATOR: '/landing/initiator', PROCESSOR: '/landing/inbox', AUDITOR: '/landing/reports', REPORT_VIEWER: '/landing/reports' });
    expect(NEUTRAL_LANDING).toBe('/landing/home');
    expect(dashboardName('/dashboard')).toBe('Admin Dashboard');
    expect(dashboardName('/landing/finance')).toBe('Finance Dashboard');
    expect(dashboardName('/landing/initiator')).toBe('Initiator Dashboard');
    expect(dashboardName('/landing/inbox')).toBe('Processor Dashboard');
    expect(dashboardName('/landing/reports')).toBe('Proposal dashboard');
    expect(dashboardName(NEUTRAL_LANDING)).toBe('Your workspace');
    for (const route of Object.values(LANDING_ROUTES)) expect(dashboardName(route)).not.toBe('');
  });

  /** @story US-LGN03-005 @ac AC-US-LGN03-005-06 @subtask ST-LGN03-005-FE-02 In plain words: supporting test. "Stay on this page" stops the redirect and changes the title; with no chosen landing (a direct visit or a refresh) the user goes back to the company page. */
  it('can pause the opening, and goes back to the company page when no landing was chosen', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
    const first = render(<LandingGate />, { wrapper });
    await screen.findByTestId('opening');
    fireEvent.click(screen.getByTestId('opening-stay'));
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByTestId('opening')).toHaveTextContent('Where AMS opens for you');
    first.unmount();
    useSessionStore.setState({ landing: null });
    render(<LandingGate />, { wrapper });
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/choose-work'));
  });

  /** @story US-LGN03-005 @ac AC-US-LGN03-005-06 @subtask ST-LGN03-005-FE-02 In plain words: supporting test. The placeholder says the dashboard is not built yet and names it. */
  it('shows a simple placeholder for a dashboard that is not built yet', () => {
    render(<RoleDashboardPlaceholder route="/landing/finance" />);
    const box = screen.getByTestId('landing-placeholder');
    expect(box).toHaveTextContent('Finance Dashboard');
    expect(box).toHaveTextContent('not built yet');
  });
});
