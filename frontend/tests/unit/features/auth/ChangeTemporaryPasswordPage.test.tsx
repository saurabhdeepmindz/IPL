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
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChangeTemporaryPassword } from '@/features/auth/hooks/usePasswordFlow';
import { authHttp } from '@/features/auth/services/auth.service';
import { changeTemporaryPassword } from '@/features/auth/services/password.service';
import { ApiError } from '@/lib/errors';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token';

const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>{children}</QueryClientProvider>;
const input = { temporaryPassword: 'Temp#4821', newPassword: 'Fresh#Pass2026' };
const saved = { data: { data: { nextStep: 'CHOOSE_WORK', accessToken: 'tok-new', expiresIn: 900 } } };

describe('User changes a temporary password at first sign-in (US-LGN02-008)', () => {
  beforeEach(() => {
    setAccessToken('tok-temporary');
    push.mockClear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  /** @tc TC-LGN02-008-J01 @story US-LGN02-008 @ac AC-US-LGN02-008-01 @subtask ST-LGN02-008-FE-02 */
  it.todo('TC-LGN02-008-J01 (owned by Task 12, the page: ST-LGN02-008-FE-02) Given a user with a temporary password, when the user signs in, then this page is shown and no other page opens until the password is changed');

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
  it.todo('TC-LGN02-008-J03 (owned by Task 12, the page: ST-LGN02-008-FE-02) Given a wrong temporary password, when the user saves, then a plain error is shown');

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
