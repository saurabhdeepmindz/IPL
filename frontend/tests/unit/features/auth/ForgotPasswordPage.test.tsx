/**
 * @file    ForgotPasswordPage.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of US-LGN02-006 (User asks for a password reset link). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-006
 * @subtask        ST-LGN02-006-FE-01
 * @lld            LLD-EPIC-LGN-02 v0.2 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/unit/features/auth/ForgotPasswordPage.test.tsx
 * @lld-synced     v0.2
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordPage, maskEmail, waitText } from '@/features/auth/components/ForgotPasswordPage';
import { useForgotPassword } from '@/features/auth/hooks/usePasswordFlow';
import { forgotPassword } from '@/features/auth/services/password.service';
import { authHttp } from '@/features/auth/services/auth.service';
import { ApiError } from '@/lib/errors';

const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>{children}</QueryClientProvider>;
const answer = (retryAfterSeconds: number) => ({ data: { data: { message: 'If the employee code and e-mail match, a link was sent.', retryAfterSeconds } } });
const renderPage = () => render(<ForgotPasswordPage />, { wrapper });
const config = { data: { data: { ssoAvailable: true, idpMode: 'saml', helpdesk: { phone: '1', email: 'it@ipl.example', hours: 'x', placeholder: false } } } };
const input = { employeeCode: '10002', email: 'k.rao@ipl.example' };

describe('User asks for a password reset link (US-LGN02-006)', () => {
  beforeEach(() => vi.spyOn(authHttp, 'get').mockResolvedValue(config));
  afterEach(() => vi.restoreAllMocks());

  /** @tc TC-LGN02-006-J01 @story US-LGN02-006 @ac AC-US-LGN02-006-01 @subtask ST-LGN02-006-FE-02 */
  it('TC-LGN02-006-J01 an empty code or e-mail shows what is missing and nothing is sent', async () => {
    const post = vi.spyOn(authHttp, 'post').mockResolvedValue(answer(60));
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTestId('forgot-submit'));
    expect(await screen.findByTestId('forgot-error-code')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-error-email')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  /** @tc TC-LGN02-006-J02 @story US-LGN02-006 @ac AC-US-LGN02-006-02 @subtask ST-LGN02-006-FE-01 */
  it('TC-LGN02-006-J02 the call posts the code and e-mail and the hook gives the answer with the time to wait', async () => {
    const post = vi.spyOn(authHttp, 'post').mockResolvedValue(answer(60));
    await expect(forgotPassword(input)).resolves.toMatchObject({ retryAfterSeconds: 60 });
    expect(post).toHaveBeenCalledWith('/auth/password/forgot', input);
    const { result } = renderHook(() => useForgotPassword(), { wrapper });
    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.retryAfterSeconds).toBe(60);
  });

  /** @tc TC-LGN02-006-J03 @story US-LGN02-006 @ac AC-US-LGN02-006-03 @subtask ST-LGN02-006-FE-01 */
  it('TC-LGN02-006-J03 a second request inside the window still answers 202 and the hook gives the time that is left', async () => {
    vi.spyOn(authHttp, 'post').mockResolvedValue(answer(42));
    const { result } = renderHook(() => useForgotPassword(), { wrapper });
    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.retryAfterSeconds).toBe(42);
  });

  /** @tc TC-LGN02-006-J04 @story US-LGN02-006 @ac AC-US-LGN02-006-04 @subtask ST-LGN02-006-FE-02 */
  it('TC-LGN02-006-J04 the page tells single sign-on users to reset the network password through the IT team', () => {
    renderPage();
    expect(screen.getByTestId('forgot-sso-note')).toHaveTextContent('IPL single sign-on');
    expect(screen.getByTestId('forgot-sso-note')).toHaveTextContent('through the IT team');
  });

  /** @tc TC-LGN02-006-J05 @story US-LGN02-006 @ac AC-US-LGN02-006-05 @subtask ST-LGN02-006-FE-02 */
  it('TC-LGN02-006-J05 a 429 shows a plain message with the time left and no check-your-e-mail page', async () => {
    vi.spyOn(authHttp, 'post').mockRejectedValue({ response: { status: 429, data: { error: { code: 'RATE_LIMITED', message: 'x', fields: [], details: { retryAfterSeconds: 120 } } } } });
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByTestId('forgot-code'), '10002');
    await user.type(screen.getByTestId('forgot-email'), 'k.rao@ipl.example');
    await user.click(screen.getByTestId('forgot-submit'));
    expect(await screen.findByTestId('forgot-wait')).toHaveTextContent('2 minutes');
    expect(screen.queryByTestId('forgot-sent')).not.toBeInTheDocument();
  });

  /** @story US-LGN02-006 @ac AC-US-LGN02-006-02 @subtask ST-LGN02-006-FE-02 In plain words: supporting test. The sent page shows the masked address, keeps the resend button off, and the mask and the wait text are plain. */
  it('supporting: the sent page masks the address and keeps Send the link again off', async () => {
    vi.spyOn(authHttp, 'post').mockResolvedValue(answer(60));
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByTestId('forgot-code'), '10002');
    await user.type(screen.getByTestId('forgot-email'), 'k.rao@ipl.example');
    await user.click(screen.getByTestId('forgot-submit'));
    expect(await screen.findByTestId('forgot-masked')).toHaveTextContent('k.***@ipl.example');
    expect(screen.getByTestId('forgot-resend')).toBeDisabled();
    expect(screen.getByTestId('forgot-countdown')).toHaveTextContent('60');
    expect(maskEmail('a@ipl.example')).toBe('a***@ipl.example');
    expect(waitText(1)).toBe('1 second');
    expect(waitText(61)).toBe('2 minutes');
  });

  /** @story US-LGN02-006 @ac AC-US-LGN02-006-05 @subtask ST-LGN02-006-FE-01 In plain words: supporting test. A 429 reaches the page as an ApiError that carries the seconds to wait. */
  it('supporting: a 429 becomes an ApiError with the seconds to wait in its details', async () => {
    vi.spyOn(authHttp, 'post').mockRejectedValue({ response: { status: 429, data: { error: { code: 'RATE_LIMITED', message: 'x', fields: [], details: { retryAfterSeconds: 120 } } } } });
    const error = await forgotPassword(input).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429, details: { retryAfterSeconds: 120 } });
  });
});
