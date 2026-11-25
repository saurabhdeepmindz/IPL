/**
 * @file    users.hooks.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest supporting tests of the user hooks (written before the code). In plain words: `useUser` loads a user by code and waits without one; `useSaveUser` creates or changes a user and refreshes the lists.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users/users.hooks.test.tsx
 * @lld-synced     v0.25
 * @status         pseudo
 */

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeactivateUser } from '@/features/users/hooks/useDeactivateUser';
import { useSaveUser } from '@/features/users/hooks/useSaveUser';
import { useUser } from '@/features/users/hooks/useUser';
import { createUser, deactivateUser, getUser, updateUser } from '@/features/users/services/users.service';

vi.mock('@/features/users/services/users.service', () => ({ getUser: vi.fn(), createUser: vi.fn(), updateUser: vi.fn(), listUsers: vi.fn(), deactivateUser: vi.fn() }));

const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
const form = { employeeCode: '20001', fullName: 'A B', email: 'a@example.invalid', departmentId: 'd', designationId: 'g', signIn: 'SSO' as const, companies: [{ companyCode: 'IPL', roleIds: ['r'], validFrom: '2026-12-01' }] };

describe('user hooks (supporting tests)', () => {
  beforeEach(() => {
    vi.mocked(getUser).mockReset();
    vi.mocked(createUser).mockReset();
    vi.mocked(updateUser).mockReset();
    vi.mocked(deactivateUser).mockReset();
  });

  /**
   * @story   US-ADM01-004
   * @ac      AC-US004-04
   * @subtask ST-ADM01-004-FE-01
   * In plain words: supporting test. useUser loads the user when a code is given and does nothing without one.
   */
  it('loads a user by code and waits without one', async () => {
    vi.mocked(getUser).mockResolvedValue({ employeeCode: '20001' } as never);
    const idle = renderHook(() => useUser(undefined), { wrapper });
    expect(idle.result.current.fetchStatus).toBe('idle');
    expect(getUser).not.toHaveBeenCalled();
    const loaded = renderHook(() => useUser('20001'), { wrapper });
    await waitFor(() => expect(loaded.result.current.data?.employeeCode).toBe('20001'));
    expect(getUser).toHaveBeenCalledWith('20001');
  });

  /**
   * @story   US-ADM01-004
   * @ac      AC-US004-01
   * @subtask ST-ADM01-004-FE-01
   * In plain words: supporting test. useSaveUser creates (with the Idempotency-Key) when no code is given, changes when one is, and marks the user lists as stale.
   */
  it('creates or changes a user and refreshes the lists', async () => {
    vi.mocked(createUser).mockResolvedValue({ employeeCode: '20001', status: 'ACTIVE', oneTimePassword: { required: false, emailStatus: null } });
    vi.mocked(updateUser).mockResolvedValue({ employeeCode: '20001' } as never);
    const spy = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useSaveUser(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ input: form, idempotencyKey: 'key-1' });
    });
    expect(createUser).toHaveBeenCalledWith(form, 'key-1');
    await act(async () => {
      await result.current.mutateAsync({ employeeCode: '20001', input: form, idempotencyKey: 'key-2' });
    });
    expect(updateUser).toHaveBeenCalledWith('20001', form);
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users'] });
  });

  /**
   * @story   US-ADM01-006
   * @ac      AC-US006-01
   * @subtask ST-ADM01-006-FE-01
   * In plain words: supporting test. useDeactivateUser sends the reason for the user and marks the user lists and the user as stale.
   */
  it('deactivates a user and refreshes the lists', async () => {
    vi.mocked(deactivateUser).mockResolvedValue({ status: 'INACTIVE' });
    const spy = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useDeactivateUser(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ employeeCode: '20001', input: { reason: 'OTHER', note: 'x' } });
    });
    expect(deactivateUser).toHaveBeenCalledWith('20001', { reason: 'OTHER', note: 'x' });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users'] });
  });
});
