/**
 * @file    SignInPage.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of US-LGN01-005 (User signs in on the sign-in page). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-01
 * @lld            LLD-EPIC-LGN-01 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/unit/features/auth/SignInPage.test.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignInPage } from '@/features/auth/components/SignInPage';
import { getPublicConfig, signIn } from '@/features/auth/services/auth.service';
import type { PublicConfig } from '@/features/auth/types/auth.types';
import { ApiError } from '@/lib/errors';
import { getAccessToken } from '@/lib/token';

const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), useSearchParams: () => new URLSearchParams('') }));
vi.mock('@/features/auth/services/auth.service', () => ({
  signIn: vi.fn(),
  getPublicConfig: vi.fn(),
  ssoStartUrl: (returnTo?: string) => 'http://auth.test/api/v1/auth/sso/start' + (returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''),
}));

const config = (over: Partial<PublicConfig> = {}): PublicConfig => ({ ssoAvailable: true, idpMode: 'saml', helpdesk: { phone: '+91 11 2345 6789', email: 'it@ipl.example', hours: 'Mon-Sat 9-18', placeholder: false }, ...over });
const renderPage = (props: { next?: string } = {}) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><SignInPage {...props} /></QueryClientProvider>);
const ok = { nextStep: 'CHOOSE_WORK' as const, user: { employeeCode: '10002', name: 'A. Kumar' }, accessToken: 'tok-1', expiresIn: 900 };

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, code = '10002', pw = 'secret-pass') {
  await user.clear(screen.getByTestId('employee-code'));
  await user.type(screen.getByTestId('employee-code'), code);
  await user.type(screen.getByTestId('password'), pw);
  await user.click(screen.getByTestId('sign-in-submit'));
}

describe('User signs in on the sign-in page (US-LGN01-005)', () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(signIn).mockReset();
    vi.mocked(getPublicConfig).mockResolvedValue(config());
  });

  /** @tc TC-LGN01-005-J01 @story US-LGN01-005 @ac AC-US-LGN01-005-01 @subtask ST-LGN01-005-FE-01 */
  it('TC-LGN01-005-J01 the single sign-on button goes to API-AUTH-02 (with the page asked for)', async () => {
    renderPage({ next: '/users' });
    const button = await screen.findByTestId('sso-button');
    expect(button).toHaveAttribute('href', 'http://auth.test/api/v1/auth/sso/start?returnTo=%2Fusers');
    expect(button).toHaveTextContent('Sign in with IPL single sign-on');
  });

  it('hides the single sign-on button when it is not configured', async () => {
    vi.mocked(getPublicConfig).mockResolvedValue(config({ ssoAvailable: false }));
    renderPage();
    await screen.findByTestId('local-sign-in-form');
    expect(screen.queryByTestId('sso-button')).toBeNull();
  });

  /** @tc TC-LGN01-005-J02 @story US-LGN01-005 @ac AC-US-LGN01-005-02 @subtask ST-LGN01-005-FE-01 */
  it('TC-LGN01-005-J02 the form calls API-AUTH-01, keeps the access token in memory and moves on; the password can be shown', async () => {
    vi.mocked(signIn).mockResolvedValue(ok);
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('local-sign-in-form');
    expect(screen.getByTestId('password')).toHaveAttribute('type', 'password');
    await user.click(screen.getByTestId('show-password'));
    expect(screen.getByTestId('password')).toHaveAttribute('type', 'text');
    await fillAndSubmit(user);
    await waitFor(() => expect(signIn).toHaveBeenCalledWith({ employeeCode: '10002', password: 'secret-pass' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/choose-work'));
    expect(getAccessToken()).toBe('tok-1');
  });

  it('a user who must change the password goes to the change-password page', async () => {
    vi.mocked(signIn).mockResolvedValue({ ...ok, nextStep: 'CHANGE_PASSWORD' });
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('local-sign-in-form');
    await fillAndSubmit(user);
    await waitFor(() => expect(push).toHaveBeenCalledWith('/choose-password'));
  });

  it('a wrong code format is refused in the browser and nothing is sent', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('local-sign-in-form');
    await fillAndSubmit(user, '12', 'x');
    expect(await screen.findByText('Enter your 5-digit employee code')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('a failure shows the panel, clears the password and keeps the code; the next try removes the old message', async () => {
    vi.mocked(signIn).mockRejectedValueOnce(new ApiError(401, 'INVALID_CREDENTIALS', 'Employee code or password is not right', {}, { attemptsLeft: 3 }));
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('local-sign-in-form');
    await fillAndSubmit(user);
    expect(await screen.findByTestId('sign-in-error')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toHaveValue('');
    expect(screen.getByTestId('employee-code')).toHaveValue('10002');
    vi.mocked(signIn).mockResolvedValueOnce(ok);
    await user.type(screen.getByTestId('password'), 'right-pass');
    await user.click(screen.getByTestId('sign-in-submit'));
    await waitFor(() => expect(screen.queryByTestId('sign-in-error')).toBeNull());
  });

  /** @tc TC-LGN01-005-J03 @story US-LGN01-005 @ac AC-US-LGN01-005-03 @subtask ST-LGN01-005-FE-01 */
  it('TC-LGN01-005-J03 the "test sign-in" banner shows only when the stub identity provider is on', async () => {
    vi.mocked(getPublicConfig).mockResolvedValue(config({ idpMode: 'stub' }));
    const { unmount } = renderPage();
    expect(await screen.findByTestId('test-banner')).toHaveTextContent(/test sign-in/i);
    unmount();
    vi.mocked(getPublicConfig).mockResolvedValue(config({ idpMode: 'saml' }));
    renderPage();
    await screen.findByTestId('local-sign-in-form');
    expect(screen.queryByTestId('test-banner')).toBeNull();
  });

  it('has a Forgot password link', async () => {
    renderPage();
    expect(await screen.findByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/forgot-password');
  });
});
