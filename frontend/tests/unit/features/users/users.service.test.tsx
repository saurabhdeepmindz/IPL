/**
 * @file    users.service.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest supporting tests of the user search (written before the code). In plain words: the search call sends the text and the page size, and the search hook waits 300 ms after typing and starts at 2 characters (contract API-USR-01).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users/users.service.test.tsx
 * @lld-synced     v0.27
 * @status         built
 */

import type { ReactNode } from 'react';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ApiClient from '@/lib/api-client';
import { useUserSearch } from '@/features/users';
import { listUsers } from '@/features/users/services/users.service';

const calls = vi.hoisted(() => [] as { url?: string; params?: unknown }[]);
vi.mock('@/lib/api-client', async () => {
  const real = await vi.importActual<typeof ApiClient>('@/lib/api-client');
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    calls.push({ url: config.url, params: config.params });
    const res: AxiosResponse = { data: { data: { items: [{ employeeCode: '10234', name: 'R. Sharma', department: 'Operations' }], total: 1 } }, status: 200, statusText: '', headers: {}, config };
    return Promise.resolve(res);
  };
  return { ...real, api: real.createApiClient(adapter) };
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
);

describe('user search (supporting tests)', () => {
  beforeEach(() => {
    calls.length = 0;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * @story   US-ADM01-013
   * @ac      AC-US013-01
   * @subtask ST-ADM01-013-FE-01
   * In plain words: supporting test. listUsers sends the text and the page size to `GET /users` and returns the users found.
   */
  it('searches users with the text and the page size', async () => {
    const out = await listUsers({ q: 'sharma', pageSize: 10 });
    expect(calls[0]).toMatchObject({ url: '/users', params: { q: 'sharma', pageSize: 10 } });
    expect(out.items[0].employeeCode).toBe('10234');
  });

  /**
   * @story   US-ADM01-013
   * @ac      AC-US013-01
   * @subtask ST-ADM01-013-FE-01
   * In plain words: supporting test. One letter does not search; after two letters the call waits 300 ms and is sent once.
   */
  it('waits 300 ms after typing and starts at 2 characters', async () => {
    const { result, rerender } = renderHook(({ text }) => useUserSearch(text), { wrapper, initialProps: { text: 'a' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(calls).toHaveLength(0);
    rerender({ text: 'sh' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(calls).toHaveLength(0);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].params).toMatchObject({ q: 'sh' });
    expect(result.current).toBeDefined();
  });
});
