/**
 * @file    auth.service.test.ts
 * @module  Tests
 *
 * @description
 * Vitest supporting test of the development sign-in call (written before the code). In plain words: it signs in through `POST /dev/sign-in`, keeps the token in memory and reads the session user from `GET /dev/whoami`.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/auth/auth.service.test.ts
 * @lld-synced     v0.25
 * @status         built
 */

import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import type * as ApiClient from '@/lib/api-client';
import { getAccessToken } from '@/lib/token';

const calls = vi.hoisted(() => [] as string[]);
vi.mock('@/lib/api-client', async () => {
  const real = await vi.importActual<typeof ApiClient>('@/lib/api-client');
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    calls.push(`${config.method} ${config.url}`);
    const signIn = config.url === '/dev/sign-in';
    const data = signIn ? { data: { accessToken: 'tok-1' } } : { data: { userId: 'u1', employeeCode: '10001', companyCode: 'IPL', departmentId: null } };
    const res: AxiosResponse = { data, status: signIn ? 201 : 200, statusText: '', headers: {}, config };
    return Promise.resolve(res);
  };
  return { ...real, api: real.createApiClient(adapter) };
});

describe('devSignIn (supporting test)', () => {
  /**
   * @story   US-ADM01-012
   * @ac      AC-US012-01
   * @subtask ST-ADM01-012-FE-04
   * In plain words: supporting test. The call posts the employee code and company, keeps the token in memory and returns the session user.
   */
  it('signs in, keeps the token in memory and returns the session user', async () => {
    const { devSignIn } = await import('@/features/auth/services/auth.service');
    const user = await devSignIn('10001', 'IPL');
    expect(calls).toEqual(['post /dev/sign-in', 'get /dev/whoami']);
    expect(getAccessToken()).toBe('tok-1');
    expect(user).toEqual({ userId: 'u1', employeeCode: '10001', companyCode: 'IPL' });
  });
});
