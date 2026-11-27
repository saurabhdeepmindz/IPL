/**
 * @file    NoCompanyAccessPage.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest case of the no-company-access page (US-LGN03-004). In plain words: a signed-in user who has no company and role valid today sees who to call (phone, e-mail, hours), a reference to quote, a button that copies the details for the IT team, and Sign out; a user who has got access meanwhile is let in.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-004
 * @subtask        ST-LGN03-004-FE-01
 * @lld            LLD-EPIC-LGN-03 v0.3 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/unit/features/auth/NoCompanyAccessPage.test.tsx
 * @lld-synced     v0.3
 * @status         elaborated
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NoCompanyAccessPage, referenceFor } from '@/features/auth/components/NoCompanyAccessPage';
import { authHttp } from '@/features/auth/services/auth.service';
import { api } from '@/lib/api-client';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token';
import { useSessionStore } from '@/store/session.store';

const push = vi.fn();
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }), usePathname: () => '/no-company-access' }));

const helpdesk = { phone: '+91 00000 00000', email: 'it.helpdesk@ipl.example', hours: 'Mon-Sat, 9:00-18:00', placeholder: true };
const noCompany = { employeeCode: '10002', name: 'A. Kumar', companies: [], financialYears: [{ label: '2026-27', current: true }], context: null, helpdesk };
const config = { data: { data: { ssoAvailable: true, idpMode: 'saml', helpdesk } } };
// 09:14 on 27 Nov 2026 in India
const NOW = new Date('2026-11-27T09:14:00+05:30');

function client() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}
function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client()}>{children}</QueryClientProvider>;
}

describe('User without a company sees the no-access page (US-LGN03-004)', () => {
  let writeText: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    setAccessToken('some-token');
    useSessionStore.setState({ status: 'signedIn', user: { userId: '', employeeCode: '10002', name: 'A. Kumar', companyCode: '' }, landing: null });
    vi.spyOn(authHttp, 'get').mockResolvedValue(config);
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: noCompany } });
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    clearAccessToken();
  });

  /** @tc TC-LGN03-004-J01 @story US-LGN03-004 @ac AC-US-LGN03-004-01 @subtask ST-LGN03-004-FE-01 In plain words: the page says no company access, shows the IT contact with the placeholder badges, a reference, the Copy details button and Sign out. */
  it('TC-LGN03-004-J01 shows the IT contact, a reference, a Copy details button and Sign out', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    render(<NoCompanyAccessPage />, { wrapper });
    expect(await screen.findByTestId('no-access')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No company access yet' })).toBeInTheDocument();
    const contact = screen.getByTestId('helpdesk');
    expect(contact).toHaveTextContent('+91 00000 00000');
    expect(contact).toHaveTextContent('it.helpdesk@ipl.example');
    expect(contact).toHaveTextContent('Mon-Sat, 9:00-18:00');
    expect(contact.querySelectorAll('[class*="badge"]')).toHaveLength(2);
    expect(screen.getByTestId('reference')).toHaveTextContent('10002-261127-0914');
    expect(screen.getByRole('button', { name: 'Copy my details for the IT team' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
    expect(screen.getByText('A. Kumar')).toBeInTheDocument();
    expect(screen.getByText('Employee code 10002')).toBeInTheDocument();
  });

  /** @story US-LGN03-004 @ac AC-US-LGN03-004-01 @subtask ST-LGN03-004-FE-01 In plain words: supporting test. The reference is the employee code, the Indian date (yymmdd) and the time (hhmm), computed in the browser. */
  it('builds the reference from the code and the Indian date and time', () => {
    expect(referenceFor('10002', new Date('2026-11-27T09:14:00+05:30'))).toBe('10002-261127-0914');
    expect(referenceFor('10002', new Date('2026-12-01T18:30:00Z'))).toBe('10002-261202-0000');
  });

  /** @story US-LGN03-004 @ac AC-US-LGN03-004-01 @subtask ST-LGN03-004-FE-01 In plain words: supporting test. Copy my details writes the name, employee code and reference to the clipboard and says so. */
  it('copies the details for the IT team', async () => {
    const user = userEvent.setup();
    render(<NoCompanyAccessPage />, { wrapper });
    await screen.findByTestId('no-access');
    await user.click(screen.getByRole('button', { name: 'Copy my details for the IT team' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const text = String(writeText.mock.calls[0][0]);
    expect(text).toContain('A. Kumar');
    expect(text).toContain('employee code 10002');
    expect(text).toMatch(/reference 10002-\d{6}-\d{4}/);
    expect(await screen.findByText('Details copied')).toBeInTheDocument();
  });

  /** @story US-LGN03-004 @ac AC-US-LGN03-004-01 @subtask ST-LGN03-004-FE-01 In plain words: supporting test. Sign out clears the browser session and goes to the sign-in page (until EPIC-LGN-04 ends the server session). */
  it('signs out', async () => {
    const user = userEvent.setup();
    render(<NoCompanyAccessPage />, { wrapper });
    await screen.findByTestId('no-access');
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(getAccessToken()).toBeNull();
    expect(useSessionStore.getState().status).toBe('signedOut');
    expect(push).toHaveBeenCalledWith('/login?reason=signedout');
  });

  /** @story US-LGN03-004 @ac AC-US-LGN03-004-01 @subtask ST-LGN03-004-FE-01 In plain words: supporting test. A user who has got access in the meantime is sent on to the company page. */
  it('lets a user in who has got access meanwhile', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: { ...noCompany, companies: [{ code: '1000', name: 'Indian Potash Limited', roles: ['Initiator'] }] } } });
    render(<NoCompanyAccessPage />, { wrapper });
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/choose-work'));
  });
});
