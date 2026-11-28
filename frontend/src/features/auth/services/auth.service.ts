/**
 * @file    auth.service.ts
 * @module  AuthFeature
 *
 * @description
 * Sign-in calls. In plain words: the development sign-in used by the tests and the demo until the sign-in epic exists (decision L-64).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story         US-LGN01-005
 * @subtask       ST-LGN01-005-FE-01
 * @lld           LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file      docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/services/auth.service.ts
 * @lld-synced    v0.5
 * @status         built
 */
import axios from 'axios';
import { api } from '@/lib/api-client';
import { env } from '@/lib/env';
import { toApiError } from '@/lib/errors';
import type { PublicConfig, SignInResponse } from '../types/auth.types';
import { setAccessToken } from '@/lib/token';

/**
 * Development sign-in. In plain words: signs in with an employee code and a company through `POST /dev/sign-in` (the API exists only in dev and test), keeps the token in memory and reads the session user from `GET /dev/whoami`.
 *
 * @epic      EPIC-ADM-01
 * @story     US-LGN01-005
 * @subtask   ST-LGN01-005-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-LGN-01 v0.5 §6.4
 * @status    built
 *
 * @dependencies api, setAccessToken
 *
 * @returns The session user
 */
export async function devSignIn(employeeCode: string, companyCode: string): Promise<{ userId: string; employeeCode: string; companyCode: string }> {
  const signedIn = await api.post<{ data: { accessToken: string } }>('/dev/sign-in', { employeeCode, companyCode });
  setAccessToken(signedIn.data.data.accessToken);
  const who = await api.get<{ data: { userId: string; employeeCode: string; companyCode: string } }>('/dev/whoami');
  const { userId, employeeCode: code, companyCode: company } = who.data.data;
  return { userId, employeeCode: code, companyCode: company };
}

/** A plain client for the Auth API: no refresh retry, so a wrong password is shown as it is (not turned into "session ended"). */
export const authHttp = axios.create({ baseURL: env.NEXT_PUBLIC_AUTH_API_BASE_URL, withCredentials: true });

/**
 * Signs in with employee code and password (API-AUTH-01).
 *
 * In plain words: sends the code and password and returns the next step, the user name and the access token. The refresh token arrives only as an HTTP-only cookie.
 *
 * @story US-LGN01-005
 * @subtask ST-LGN01-005-FE-02
 */
export async function signIn(input: { employeeCode: string; password: string }): Promise<SignInResponse> {
  try {
    return (await authHttp.post<{ data: SignInResponse }>('/auth/sign-in', input)).data.data;
  } catch (e) {
    throw toApiError(e);
  }
}

/**
 * Address that starts single sign-on (API-AUTH-02).
 *
 * In plain words: the browser goes there as a normal page visit; the Auth API redirects to the identity provider.
 *
 * @story US-LGN01-005
 * @subtask ST-LGN01-005-FE-02
 */
export function ssoStartUrl(returnTo?: string): string {
  return `${env.NEXT_PUBLIC_AUTH_API_BASE_URL}/auth/sso/start${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
}

/**
 * Reads the settings the sign-in page needs (API-AUTH-05).
 *
 * In plain words: whether single sign-on is configured, the helpdesk contact, and the identity mode outside production.
 *
 * @story US-LGN01-005
 * @subtask ST-LGN01-005-FE-02
 */
export async function getPublicConfig(): Promise<PublicConfig> {
  try {
    return (await authHttp.get<{ data: PublicConfig }>('/auth/public-config')).data.data;
  } catch (e) {
    throw toApiError(e);
  }
}
