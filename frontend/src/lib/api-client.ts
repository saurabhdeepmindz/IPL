/**
 * @file    api-client.ts
 * @module  ApiClient
 *
 * @description
 * The one Axios client of the front end. In plain words: it adds the access token to every call; when the API says "not signed in" it asks for a new token once, repeats the call once, and signs the user out if that fails.
 * The refresh token travels only in the HTTP-only cookie (`withCredentials`); this file never reads or stores it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-02
 */
import axios, { type AxiosAdapter, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/lib/env';
import { toApiError } from '@/lib/errors';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token';
import { useSessionStore } from '@/store/session.store';

/** Path of the refresh route. TBD-ADM01-02: confirmed by the sign-in epic. */
export const REFRESH_PATH = '/auth/refresh';

type Retryable = InternalAxiosRequestConfig & { _retried?: boolean };

/**
 * Build an API client.
 *
 * In plain words: use the shared `api` below in the app; tests pass a fake adapter.
 *
 * @param adapter Optional network adapter (tests only)
 * @returns A configured Axios instance
 */
export function createApiClient(adapter?: AxiosAdapter): AxiosInstance {
  const client = axios.create({ baseURL: env.NEXT_PUBLIC_API_BASE_URL, withCredentials: true, adapter });
  let refreshing: Promise<string> | null = null;

  const refresh = (): Promise<string> => {
    refreshing ??= client
      .post<{ data: { accessToken: string } }>(REFRESH_PATH, undefined, { _retried: true } as Retryable)
      .then((r) => {
        setAccessToken(r.data.data.accessToken);
        return r.data.data.accessToken;
      })
      .finally(() => {
        refreshing = null;
      });
    return refreshing;
  };

  const endSession = (): void => {
    clearAccessToken();
    useSessionStore.getState().signOut();
  };

  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const apiError = toApiError(error);
      const config = (error as { config?: Retryable }).config;
      if (apiError.status !== 401 || !config) throw apiError;
      if (config._retried) {
        endSession();
        throw apiError;
      }
      try {
        const token = await refresh();
        config._retried = true;
        config.headers.set('Authorization', `Bearer ${token}`);
        return await client.request(config);
      } catch (retryError) {
        endSession();
        throw toApiError(retryError);
      }
    },
  );
  return client;
}

/** The shared client used by every feature service. */
export const api = createApiClient();
