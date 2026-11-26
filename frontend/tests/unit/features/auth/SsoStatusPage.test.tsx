/**
 * @file    SsoStatusPage.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of US-LGN01-007 (User sees what happened when single sign-on does not work). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-007
 * @subtask        ST-LGN01-007-FE-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/unit/features/auth/SsoStatusPage.test.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SsoStatusPage } from '@/features/auth/components/SsoStatusPage';
import { getPublicConfig } from '@/features/auth/services/auth.service';

vi.mock('@/features/auth/services/auth.service', () => ({ signIn: vi.fn(), getPublicConfig: vi.fn(), ssoStartUrl: () => 'http://auth.test/api/v1/auth/sso/start' }));

const helpdesk = { phone: '+91 11 2345 6789', email: 'it@ipl.example', hours: 'Mon-Sat 9-18', placeholder: false };
const show = (state: string, reference?: string) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><SsoStatusPage state={state} reference={reference} /></QueryClientProvider>);

describe('User sees what happened when single sign-on does not work (US-LGN01-007)', () => {
  beforeEach(() => vi.mocked(getPublicConfig).mockResolvedValue({ ssoAvailable: true, idpMode: 'saml', helpdesk }));

  /** @tc TC-LGN01-007-J01 @story US-LGN01-007 @ac AC-US-LGN01-007-01 @subtask ST-LGN01-007-FE-01 */
  it('TC-LGN01-007-J01 failed: says it did not work, offers Try again and the AMS password, the IT contact and the reference', async () => {
    show('failed', 'FAI-1234-ABCD');
    expect(screen.getByTestId('sso-status')).toHaveTextContent(/did not work/i);
    expect(screen.getByTestId('sso-try-again')).toHaveAttribute('href', 'http://auth.test/api/v1/auth/sso/start');
    expect(screen.getByTestId('sso-password-instead')).toHaveAttribute('href', '/login');
    expect(await screen.findByTestId('reference')).toHaveTextContent('FAI-1234-ABCD');
    expect(await screen.findByTestId('helpdesk')).toHaveTextContent('it@ipl.example');
  });

  /** @tc TC-LGN01-007-J02 @story US-LGN01-007 @ac AC-US-LGN01-007-02 @subtask ST-LGN01-007-FE-01 */
  it('TC-LGN01-007-J02 noaccount: says the person is not set up, offers Close, shows the contact and the reference, no Try again', async () => {
    show('noaccount', 'NOA-9911-WXYZ');
    expect(screen.getByTestId('sso-status')).toHaveTextContent(/not set up/i);
    expect(screen.getByTestId('sso-close')).toHaveAttribute('href', '/login');
    expect(screen.queryByTestId('sso-try-again')).toBeNull();
    expect(await screen.findByTestId('reference')).toHaveTextContent('NOA-9911-WXYZ');
    expect(await screen.findByTestId('helpdesk')).toBeInTheDocument();
  });

  /** @tc TC-LGN01-007-J03 @story US-LGN01-007 @ac AC-US-LGN01-007-03 @subtask ST-LGN01-007-FE-01 */
  it('TC-LGN01-007-J03 cancelled: says it was cancelled and offers Try again', () => {
    show('cancelled');
    expect(screen.getByTestId('sso-status')).toHaveTextContent(/cancelled/i);
    expect(screen.getByTestId('sso-try-again')).toBeInTheDocument();
  });

  /** @tc TC-LGN01-007-J04 @story US-LGN01-007 @ac AC-US-LGN01-007-04 @subtask ST-LGN01-007-FE-01 */
  it('TC-LGN01-007-J04 waiting: a progress state with a way back; an unknown state is shown as failed', () => {
    const { unmount } = show('waiting');
    expect(screen.getByTestId('sso-status')).toHaveTextContent(/signing you in/i);
    expect(screen.getByRole('link', { name: /cancel and go back/i })).toHaveAttribute('href', '/login');
    unmount();
    show('nonsense');
    expect(screen.getByTestId('sso-status')).toHaveTextContent(/did not work/i);
  });
});
