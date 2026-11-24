/**
 * @file    api-client.test.ts
 * @module  ApiClient
 *
 * @description
 * Supporting tests of ST-ADM01-000-FE-02, written before the code.
 * In plain words: a 401 refreshes once and retries once, a second 401 signs the user out, nothing goes to browser storage, and a 422 body becomes field errors.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-02
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApiClient, REFRESH_PATH } from './api-client';
import { ApiError } from './errors';
import { clearAccessToken, getAccessToken, setAccessToken } from './token';
import { useSessionStore } from '@/store/session.store';

type Reply = { status: number; data: unknown };

/** A fake network: each path has a list of replies, used in order (the last one repeats). */
function fakeNetwork(script: Record<string, Reply[]>) {
  const calls: { path: string; auth?: string }[] = [];
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    const path = config.url ?? '';
    calls.push({ path, auth: config.headers.get('Authorization') as string | undefined });
    const list = script[path] ?? [{ status: 404, data: { error: { code: 'NOT_FOUND', message: 'x', fields: [] } } }];
    const reply = list[Math.min(calls.filter((c) => c.path === path).length - 1, list.length - 1)];
    const response: AxiosResponse = { data: reply.data, status: reply.status, statusText: '', headers: {}, config };
    return reply.status >= 200 && reply.status < 300
      ? Promise.resolve(response)
      : Promise.reject(Object.assign(new Error('failed'), { isAxiosError: true, response, config }));
  };
  return { adapter, calls };
}

const unauth = { status: 401, data: { error: { code: 'UNAUTHENTICATED', message: 'Sign in', fields: [] } } };

describe('ST-ADM01-000-FE-02 API client', () => {
  beforeEach(() => {
    clearAccessToken();
    useSessionStore.getState().signOut();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('a 401 triggers exactly one refresh and one retry', async () => {
    const net = fakeNetwork({
      '/users': [unauth, { status: 200, data: { data: ['ok'] } }],
      [REFRESH_PATH]: [{ status: 200, data: { data: { accessToken: 'new-token' } } }],
    });
    setAccessToken('old-token');
    const api = createApiClient(net.adapter);
    const res = await api.get('/users');
    expect(res.data).toEqual({ data: ['ok'] });
    expect(net.calls.filter((c) => c.path === REFRESH_PATH)).toHaveLength(1);
    expect(net.calls.filter((c) => c.path === '/users')).toHaveLength(2);
    expect(net.calls.at(-1)?.auth).toBe('Bearer new-token');
    expect(getAccessToken()).toBe('new-token');
  });

  it('several calls failing together share one refresh', async () => {
    const net = fakeNetwork({
      '/a': [unauth, { status: 200, data: { data: 'a' } }],
      '/b': [unauth, { status: 200, data: { data: 'b' } }],
      [REFRESH_PATH]: [{ status: 200, data: { data: { accessToken: 't2' } } }],
    });
    const api = createApiClient(net.adapter);
    await Promise.all([api.get('/a'), api.get('/b')]);
    expect(net.calls.filter((c) => c.path === REFRESH_PATH)).toHaveLength(1);
  });

  it('a second 401 after the refresh signs the user out', async () => {
    const net = fakeNetwork({
      '/users': [unauth, unauth],
      [REFRESH_PATH]: [{ status: 200, data: { data: { accessToken: 't3' } } }],
    });
    useSessionStore.getState().signIn({ userId: 'u', employeeCode: '10001', companyCode: 'IPL' });
    const api = createApiClient(net.adapter);
    await expect(api.get('/users')).rejects.toBeInstanceOf(ApiError);
    expect(net.calls.filter((c) => c.path === REFRESH_PATH)).toHaveLength(1);
    expect(getAccessToken()).toBeNull();
    expect(useSessionStore.getState().status).toBe('signedOut');
  });

  it('a failed refresh signs the user out', async () => {
    const net = fakeNetwork({ '/users': [unauth], [REFRESH_PATH]: [unauth] });
    useSessionStore.getState().signIn({ userId: 'u', employeeCode: '10001', companyCode: 'IPL' });
    const api = createApiClient(net.adapter);
    await expect(api.get('/users')).rejects.toBeInstanceOf(ApiError);
    expect(useSessionStore.getState().status).toBe('signedOut');
  });

  it('nothing is written to localStorage or sessionStorage', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const net = fakeNetwork({
      '/users': [unauth, { status: 200, data: { data: [] } }],
      [REFRESH_PATH]: [{ status: 200, data: { data: { accessToken: 'secret-access' } } }],
    });
    setAccessToken('first');
    await createApiClient(net.adapter).get('/users');
    expect(setItem).not.toHaveBeenCalled();
    expect(localStorage.length + sessionStorage.length).toBe(0);
    setItem.mockRestore();
  });

  it('a 422 body becomes field errors keyed by field name', async () => {
    const net = fakeNetwork({
      '/users': [
        {
          status: 422,
          data: { error: { code: 'VALIDATION_FAILED', message: 'bad', fields: [{ field: 'email', message: 'must be an e-mail' }, { field: 'fullName', message: 'too short' }] } },
        },
      ],
    });
    const err = await createApiClient(net.adapter).post('/users', {}).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    const apiErr = err as ApiError;
    expect(apiErr.status).toBe(422);
    expect(apiErr.code).toBe('VALIDATION_FAILED');
    expect(apiErr.fields).toEqual({ email: 'must be an e-mail', fullName: 'too short' });
  });

  it('a network failure becomes an ApiError with code NETWORK_ERROR', async () => {
    const adapter: AxiosAdapter = () => Promise.reject(Object.assign(new Error('offline'), { isAxiosError: true }));
    const err = (await createApiClient(adapter).get('/users').catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('NETWORK_ERROR');
  });
});
