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
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useForgotPassword } from '@/features/auth/hooks/usePasswordFlow';
import { forgotPassword } from '@/features/auth/services/password.service';
import { authHttp } from '@/features/auth/services/auth.service';
import { ApiError } from '@/lib/errors';

const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>{children}</QueryClientProvider>;
const answer = (retryAfterSeconds: number) => ({ data: { data: { message: 'If the employee code and e-mail match, a link was sent.', retryAfterSeconds } } });
const input = { employeeCode: '10002', email: 'k.rao@ipl.example' };

describe('User asks for a password reset link (US-LGN02-006)', () => {
  afterEach(() => vi.restoreAllMocks());

  /** @tc TC-LGN02-006-J01 @story US-LGN02-006 @ac AC-US-LGN02-006-01 @subtask ST-LGN02-006-FE-02 */
  it.todo('TC-LGN02-006-J01 (owned by Task 4, the page: ST-LGN02-006-FE-02) Given the form, when the code or the e-mail is empty, then the form shows what is missing and nothing is sent');

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
  it.todo('TC-LGN02-006-J04 (owned by Task 4, the page: ST-LGN02-006-FE-02) Given the user signs in with SSO, when the page is shown, then it tells the user to reset the IPL network password through the IT team');

  /** @tc TC-LGN02-006-J05 @story US-LGN02-006 @ac AC-US-LGN02-006-05 @subtask ST-LGN02-006-FE-02 */
  it.todo('TC-LGN02-006-J05 (owned by Task 4, the page: ST-LGN02-006-FE-02) Given the limit is passed, when the answer is 429, then a plain message and the time left are shown');

  /** @story US-LGN02-006 @ac AC-US-LGN02-006-05 @subtask ST-LGN02-006-FE-01 In plain words: supporting test. A 429 reaches the page as an ApiError that carries the seconds to wait. */
  it('supporting: a 429 becomes an ApiError with the seconds to wait in its details', async () => {
    vi.spyOn(authHttp, 'post').mockRejectedValue({ response: { status: 429, data: { error: { code: 'RATE_LIMITED', message: 'x', fields: [], details: { retryAfterSeconds: 120 } } } } });
    const error = await forgotPassword(input).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429, details: { retryAfterSeconds: 120 } });
  });
});
