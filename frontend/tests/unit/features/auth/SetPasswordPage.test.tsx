/**
 * @file    SetPasswordPage.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of US-LGN02-007 (User sets a new password from the link). In plain words: the five password rules, the link check and the save call are tested without a page; the page cases come with the page (Task 7).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-007
 * @subtask        ST-LGN02-007-FE-01
 * @lld            LLD-EPIC-LGN-02 v0.2 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/unit/features/auth/SetPasswordPage.test.tsx
 * @lld-synced     v0.2
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useResetLink, useSetPassword } from '@/features/auth/hooks/usePasswordFlow';
import { evaluateRules, newPasswordSchema } from '@/features/auth/schemas/passwordSchema';
import { authHttp } from '@/features/auth/services/auth.service';
import { checkResetLink, resetPassword } from '@/features/auth/services/password.service';
import { ApiError } from '@/lib/errors';

const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: 3, retryDelay: 1 }, mutations: { retry: false } } })}>{children}</QueryClientProvider>;
const gone = { response: { status: 410, data: { error: { code: 'LINK_EXPIRED', message: 'This link has expired. Ask for a new one.', fields: [], details: {} } } } };
const met = (password: string) => evaluateRules(password).filter((r) => r.met).map((r) => r.id);

describe('User sets a new password from the link (US-LGN02-007)', () => {
  afterEach(() => vi.restoreAllMocks());

  /** @tc TC-LGN02-007-J01 @story US-LGN02-007 @ac AC-US-LGN02-007-01 @subtask ST-LGN02-007-FE-01 */
  it('TC-LGN02-007-J01 each rule is shown as met or not, and the form is valid only when all five are met and both fields are equal', () => {
    expect(evaluateRules('')).toHaveLength(5);
    expect(met('')).toEqual([]);
    expect(met('abc')).toEqual(['lower']);
    expect(met('Abcdefg1')).toEqual(['length', 'upper', 'lower', 'number']);
    expect(met('Abcdefg1@')).toEqual(['length', 'upper', 'lower', 'number', 'symbol']);
    expect(newPasswordSchema.safeParse({ newPassword: 'Abcdefg1', confirm: 'Abcdefg1' }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ newPassword: 'Abcdefg1@', confirm: 'Abcdefg1#' }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ newPassword: 'Abcdefg1@', confirm: 'Abcdefg1@' }).success).toBe(true);
  });

  /** @tc TC-LGN02-007-J02 @story US-LGN02-007 @ac AC-US-LGN02-007-02 @subtask ST-LGN02-007-FE-02 */
  it.todo('TC-LGN02-007-J02 (owned by Task 7, the page: ST-LGN02-007-FE-02) Given the new password equals one of the last 3, when the user saves, then a plain message is shown and the form is kept');

  /** @tc TC-LGN02-007-J03 @story US-LGN02-007 @ac AC-US-LGN02-007-03 @subtask ST-LGN02-007-FE-01 */
  it('TC-LGN02-007-J03 a used or expired link gives a 410 error at once, without trying again', async () => {
    const get = vi.spyOn(authHttp, 'get').mockRejectedValue(gone);
    await expect(checkResetLink('tok-1')).rejects.toMatchObject({ status: 410, code: 'LINK_EXPIRED' });
    expect(get).toHaveBeenCalledWith('/auth/password/reset/tok-1');
    get.mockClear();
    const { result } = renderHook(() => useResetLink('tok-1'), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(get).toHaveBeenCalledTimes(1);
  });

  /** @tc TC-LGN02-007-J04 @story US-LGN02-007 @ac AC-US-LGN02-007-04 @subtask ST-LGN02-007-FE-01 */
  it('TC-LGN02-007-J04 a valid link and password are posted and the hook reports success', async () => {
    const post = vi.spyOn(authHttp, 'post').mockResolvedValue({ data: { data: { done: true } } });
    await expect(resetPassword({ token: 'tok-1', newPassword: 'Abcdefg1@' })).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith('/auth/password/reset', { token: 'tok-1', newPassword: 'Abcdefg1@' });
    const { result } = renderHook(() => useSetPassword(), { wrapper });
    result.current.mutate({ token: 'tok-1', newPassword: 'Abcdefg1@' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  /** @story US-LGN02-007 @ac AC-US-LGN02-007-02, AC-US-LGN02-007-03 @subtask ST-LGN02-007-FE-01 In plain words: supporting test. A good link gives the masked address; a reused password reaches the page as a 422 with the field message. */
  it('supporting: a good link gives the masked address, and a reused password keeps the server message', async () => {
    vi.spyOn(authHttp, 'get').mockResolvedValue({ data: { data: { valid: true, maskedEmail: 'k.***@ipl.example' } } });
    await expect(checkResetLink('tok-1')).resolves.toEqual({ valid: true, maskedEmail: 'k.***@ipl.example' });
    vi.spyOn(authHttp, 'post').mockRejectedValue({ response: { status: 422, data: { error: { code: 'PASSWORD_REUSED', message: 'x', fields: [{ field: 'password', message: 'Choose a password you have not used before' }], details: {} } } } });
    const error = await resetPassword({ token: 'tok-1', newPassword: 'Abcdefg1@' }).catch((e: unknown) => e);
    expect(error).toMatchObject({ status: 422, code: 'PASSWORD_REUSED', fields: { password: 'Choose a password you have not used before' } });
  });
});
