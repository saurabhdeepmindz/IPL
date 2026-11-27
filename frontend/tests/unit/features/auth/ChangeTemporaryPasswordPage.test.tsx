/**
 * @file    ChangeTemporaryPasswordPage.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of US-LGN02-008 (User changes a temporary password at first sign-in). In plain words: the call and the hook of the temporary-password change are tested without a page; the page cases come with the page (Task 12).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-008
 * @subtask        ST-LGN02-008-FE-01
 * @lld            LLD-EPIC-LGN-02 v0.2 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/unit/features/auth/ChangeTemporaryPasswordPage.test.tsx
 * @lld-synced     v0.2
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChangeTemporaryPasswordPage } from '@/features/auth/components/ChangeTemporaryPasswordPage';
import { useChangeTemporaryPassword } from '@/features/auth/hooks/usePasswordFlow';
import { authHttp } from '@/features/auth/services/auth.service';
import { changeTemporaryPassword } from '@/features/auth/services/password.service';
import { ApiError } from '@/lib/errors';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token';
import { useSessionStore } from '@/store/session.store';

const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>{children}</QueryClientProvider>;
const config = { data: { data: { ssoAvailable: true, idpMode: 'saml', helpdesk: { phone: '1', email: 'it@ipl.example', hours: 'x', placeholder: false } } } };
const renderPage = () => render(<ChangeTemporaryPasswordPage />, { wrapper });
const input = { temporaryPassword: 'Temp#4821', newPassword: 'Fresh#Pass2026' };
const saved = { data: { data: { nextStep: 'CHOOSE_WORK', accessToken: 'tok-new', expiresIn: 900 } } };

describe('User changes a temporary password at first sign-in (US-LGN02-008)', () => {
  beforeEach(() => {
    setAccessToken('tok-temporary');
    push.mockClear();
    useSessionStore.getState().signIn({ userId: '', employeeCode: '20488', companyCode: '' });
    vi.spyOn(authHttp, 'get').mockResolvedValue(config);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
    useSessionStore.getState().signOut();
  });

  /** @tc TC-LGN02-008-J01 @story US-LGN02-008 @ac AC-US-LGN02-008-01 @subtask ST-LGN02-008-FE-02 */
  it('TC-LGN02-008-J01 the page is shown with the user chip and Sign out, and Sign out ends the session', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByTestId('choose-page')).toHaveTextContent('Choose your own password');
    expect(screen.getByTestId('choose-chip')).toHaveTextContent('20488');
    await user.click(screen.getByTestId('choose-sign-out'));
    expect(push).toHaveBeenCalledWith('/login?reason=signedout');
    expect(getAccessToken()).toBeNull();
    expect(useSessionStore.getState().status).toBe('signedOut');
  });

  /** @tc TC-LGN02-008-J02 @story US-LGN02-008 @ac AC-US-LGN02-008-02 @subtask ST-LGN02-008-FE-01 */
  it('TC-LGN02-008-J02 the call sends the temporary token, the hook keeps the new token and goes on to company and year', async () => {
    const post = vi.spyOn(authHttp, 'post').mockResolvedValue(saved);
    await expect(changeTemporaryPassword(input)).resolves.toMatchObject({ nextStep: 'CHOOSE_WORK', accessToken: 'tok-new' });
    expect(post).toHaveBeenCalledWith('/auth/password/change-temporary', input, { headers: { Authorization: 'Bearer tok-temporary' } });
    const { result } = renderHook(() => useChangeTemporaryPassword(), { wrapper });
    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAccessToken()).toBe('tok-new');
    expect(push).toHaveBeenCalledWith('/choose-work');
  });

  /** @tc TC-LGN02-008-J03 @story US-LGN02-008 @ac AC-US-LGN02-008-03 @subtask ST-LGN02-008-FE-02 */
  it('TC-LGN02-008-J03 a wrong temporary password shows a plain error with the attempts left and keeps the form', async () => {
    vi.spyOn(authHttp, 'post').mockRejectedValue({ response: { status: 401, data: { error: { code: 'INVALID_CREDENTIALS', message: 'x', fields: [], details: { attemptsLeft: 4 } } } } });
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByTestId('choose-temp'), 'wrong-one');
    await user.type(screen.getByTestId('choose-new'), 'Fresh#Pass2026');
    await user.type(screen.getByTestId('choose-confirm'), 'Fresh#Pass2026');
    await user.click(screen.getByTestId('choose-submit'));
    expect(await screen.findByTestId('choose-error')).toHaveTextContent('not the temporary password the IT team sent. 4 attempts left.');
    expect(screen.getByTestId('choose-new')).toHaveValue('Fresh#Pass2026');
    expect(push).not.toHaveBeenCalled();
  });

  /** @story US-LGN02-008 @ac AC-US-LGN02-008-02 @subtask ST-LGN02-008-FE-02 In plain words: supporting test. Empty or unequal entries are stopped in the browser, the same password as the temporary one too, and good entries are saved and lead on. */
  it('supporting: the form stops bad entries in the browser and saves good ones', async () => {
    const post = vi.spyOn(authHttp, 'post').mockResolvedValue(saved);
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTestId('choose-submit'));
    expect(await screen.findByTestId('choose-error')).toHaveTextContent('Enter the temporary password');
    await user.type(screen.getByTestId('choose-temp'), 'Fresh#Pass2026');
    await user.type(screen.getByTestId('choose-new'), 'Fresh#Pass2026');
    await user.type(screen.getByTestId('choose-confirm'), 'Fresh#Pass2026');
    await user.click(screen.getByTestId('choose-submit'));
    expect(await screen.findByTestId('choose-error-new')).toHaveTextContent('different from the temporary one');
    expect(post).not.toHaveBeenCalled();
    await user.clear(screen.getByTestId('choose-temp'));
    await user.type(screen.getByTestId('choose-temp'), 'Temp#4821');
    await user.click(screen.getByTestId('choose-submit'));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/choose-work'));
    expect(post).toHaveBeenCalledTimes(1);
  });

  /** @story US-LGN02-008 @ac AC-US-LGN02-008-03 @subtask ST-LGN02-008-FE-01 In plain words: supporting test. A wrong temporary password reaches the page as a 401 with the attempts left, and the token is not replaced. */
  it('supporting: a wrong temporary password is an ApiError 401 with the attempts left and the token stays', async () => {
    vi.spyOn(authHttp, 'post').mockRejectedValue({ response: { status: 401, data: { error: { code: 'INVALID_CREDENTIALS', message: 'x', fields: [], details: { attemptsLeft: 4 } } } } });
    const { result } = renderHook(() => useChangeTemporaryPassword(), { wrapper });
    result.current.mutate(input);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error).toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS', details: { attemptsLeft: 4 } });
    expect(getAccessToken()).toBe('tok-temporary');
    expect(push).not.toHaveBeenCalled();
  });
});
