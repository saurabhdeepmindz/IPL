/**
 * @file    SignInErrorPanel.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of US-LGN01-006 (User sees why a password sign-in failed). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-006
 * @subtask        ST-LGN01-006-FE-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/unit/features/auth/SignInErrorPanel.test.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignInErrorPanel } from '@/features/auth/components/SignInErrorPanel';
import { getPublicConfig } from '@/features/auth/services/auth.service';
import { ApiError } from '@/lib/errors';

vi.mock('@/features/auth/services/auth.service', () => ({ signIn: vi.fn(), getPublicConfig: vi.fn(), ssoStartUrl: () => '/sso' }));

const helpdesk = { phone: '+91 11 2345 6789', email: 'it@ipl.example', hours: 'Mon-Sat 9-18', placeholder: false };
const show = (error: ApiError) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><SignInErrorPanel error={error} /></QueryClientProvider>);

describe('User sees why a password sign-in failed (US-LGN01-006)', () => {
  beforeEach(() => vi.mocked(getPublicConfig).mockResolvedValue({ ssoAvailable: true, idpMode: 'saml', helpdesk }));

  /** @tc TC-LGN01-006-J01 @story US-LGN01-006 @ac AC-US-LGN01-006-01 @subtask ST-LGN01-006-FE-02 */
  it('TC-LGN01-006-J01 a 401 gives one message for a wrong code and a wrong password, with the attempts left', async () => {
    show(new ApiError(401, 'INVALID_CREDENTIALS', 'x', {}, { attemptsLeft: 3 }));
    const panel = await screen.findByTestId('sign-in-error');
    expect(panel).toHaveTextContent('The employee code or password is not correct');
    expect(panel).toHaveTextContent('3 attempts left');
    expect(panel).not.toHaveTextContent(/which one/i);
  });

  it('says "1 attempt left" in the singular and has an icon and words, not colour alone', async () => {
    show(new ApiError(401, 'INVALID_CREDENTIALS', 'x', {}, { attemptsLeft: 1 }));
    const panel = await screen.findByTestId('sign-in-error');
    expect(panel).toHaveTextContent('1 attempt left');
    expect(panel.querySelector('[data-testid="error-icon"]')).not.toBeNull();
    expect(panel).toHaveAttribute('role', 'alert');
  });

  /** @tc TC-LGN01-006-J02 @story US-LGN01-006 @ac AC-US-LGN01-006-02 @subtask ST-LGN01-006-FE-02 */
  it('TC-LGN01-006-J02 a 423 says the account is locked for 15 minutes, when it opens again, and that the IT team can unlock it sooner', async () => {
    show(new ApiError(423, 'ACCOUNT_LOCKED', 'x', {}, { lockedUntil: '2026-11-26T10:15:00.000Z', reference: 'LCK-1002-8H3K' }));
    const panel = await screen.findByTestId('sign-in-error');
    expect(panel).toHaveTextContent(/locked for 15 minutes/i);
    expect(panel).toHaveTextContent(/until \d\d:\d\d/i);
    expect(panel).toHaveTextContent(/IT team can unlock it sooner/i);
    expect(await screen.findByTestId('reference')).toHaveTextContent('LCK-1002-8H3K');
  });

  /** @tc TC-LGN01-006-J03 @story US-LGN01-006 @ac AC-US-LGN01-006-03 @subtask ST-LGN01-006-FE-02 */
  it('TC-LGN01-006-J03 no error means no panel (the page removes the old message on the next try)', () => {
    const { container } = render(<div data-testid="holder" />);
    expect(container.querySelector('[data-testid="sign-in-error"]')).toBeNull();
  });

  /** @tc TC-LGN01-006-J04 @story US-LGN01-006 @ac AC-US-LGN01-006-04 @subtask ST-LGN01-006-FE-02 */
  it('TC-LGN01-006-J04 a 403 says the account is inactive with the IT contact and the reference', async () => {
    show(new ApiError(403, 'ACCOUNT_INACTIVE', 'x', {}, { reference: 'INA-4411-Q7ZP' }));
    const panel = await screen.findByTestId('sign-in-error');
    expect(panel).toHaveTextContent(/inactive/i);
    expect(await screen.findByTestId('reference')).toHaveTextContent('INA-4411-Q7ZP');
    expect(await screen.findByTestId('helpdesk')).toHaveTextContent('+91 11 2345 6789');
    expect(screen.getByTestId('helpdesk')).toHaveTextContent('it@ipl.example');
  });

  it('a 429 says to wait the seconds given; a network error says the server could not be reached', async () => {
    const { unmount } = show(new ApiError(429, 'RATE_LIMITED', 'x', {}, { retryAfterSeconds: 42 }));
    expect(await screen.findByTestId('sign-in-error')).toHaveTextContent(/wait 42 seconds/i);
    unmount();
    show(new ApiError(0, 'NETWORK_ERROR', 'The server could not be reached.'));
    expect(await screen.findByTestId('sign-in-error')).toHaveTextContent(/could not be reached/i);
  });
});
