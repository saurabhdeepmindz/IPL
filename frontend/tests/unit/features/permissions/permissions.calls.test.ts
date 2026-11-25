/**
 * @file    permissions.calls.test.ts
 * @module  Tests
 *
 * @description
 * Supporting tests of the matrix call and hook. In plain words: the answer is kept with the matrix version; 403 and a network error reach the caller.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/permissions/permissions.calls.test.ts
 * @lld-synced     v0.27
 * @status         elaborated
 */

import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ApiClient from '@/lib/api-client';
import type { ApiError } from '@/lib/errors';
import { usePermissionMatrix } from '@/features/permissions/hooks/usePermissionMatrix';
import { getMatrix } from '@/features/permissions/services/permissions.service';

const seen = vi.hoisted(() => ({ calls: [] as { method?: string; url?: string }[], next: { status: 200, data: {} as unknown } }));
vi.mock('@/lib/api-client', async () => {
  const real = await vi.importActual<typeof ApiClient>('@/lib/api-client');
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    seen.calls.push({ method: config.method, url: config.url });
    const res: AxiosResponse = { data: seen.next.data, status: seen.next.status, statusText: '', headers: {}, config };
    return seen.next.status < 300 ? Promise.resolve(res) : Promise.reject(Object.assign(new Error('x'), { isAxiosError: true, response: res, config }));
  };
  return { ...real, api: real.createApiClient(adapter) };
});

const answer = (status: number, data: unknown) => {
  seen.next = { status, data };
};
const caught = async (p: Promise<unknown>): Promise<ApiError> => p.then(() => { throw new Error('should have failed'); }, (e: unknown) => e as ApiError);
const matrix = {
  matrixVersion: 'v-1',
  roles: [{ roleId: 'r1', name: 'Initiator', userCount: 12 }],
  groups: [{ module: 'Users', permissions: [{ key: 'users.view', label: 'View users', hint: 'See the user list', cells: { r1: { allowed: true, scope: 'COMPANY', locked: false } } }] }],
};

describe('permission matrix call and hook (supporting tests)', () => {
  beforeEach(() => {
    seen.calls.length = 0;
  });

  /**
   * @story   US-ADM01-015
   * @ac      AC-US015-01
   * @subtask ST-ADM01-015-FE-01
   * In plain words: supporting test. getMatrix reads the matrix path and keeps the matrix version, the roles with their user counts and the groups with their cells.
   */
  it('reads the matrix and keeps the whole answer', async () => {
    answer(200, { data: matrix });
    const out = await getMatrix();
    expect(seen.calls[0]).toMatchObject({ method: 'get', url: '/roles/permissions/matrix' });
    expect(out.matrixVersion).toBe('v-1');
    expect(out.roles).toEqual([{ roleId: 'r1', name: 'Initiator', userCount: 12 }]);
    expect(out.groups[0].permissions[0].cells.r1).toEqual({ allowed: true, scope: 'COMPANY', locked: false });
  });

  /**
   * @story   US-ADM01-015
   * @ac      AC-US015-01
   * @subtask ST-ADM01-015-FE-01
   * In plain words: supporting test. A 403 and a network error reach the caller with their status and code.
   */
  it('maps a 403 and a network error', async () => {
    answer(403, { error: { code: 'FORBIDDEN', message: 'x', fields: [] } });
    expect(await caught(getMatrix())).toMatchObject({ status: 403, code: 'FORBIDDEN' });
    answer(500, {});
    expect(await caught(getMatrix())).toMatchObject({ status: 500 });
  });

  /**
   * @story   US-ADM01-015
   * @ac      AC-US015-04
   * @subtask ST-ADM01-015-FE-01
   * In plain words: supporting test. usePermissionMatrix reads the matrix once and does not read it again when the window gets the focus, so unsaved changes are not disturbed.
   */
  it('reads once and not again on window focus', async () => {
    answer(200, { data: matrix });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client }, children);
    const { result } = renderHook(() => usePermissionMatrix(), { wrapper });
    await waitFor(() => expect(result.current.data?.matrixVersion).toBe('v-1'));
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 50));
    expect(seen.calls).toHaveLength(1);
  });
});
