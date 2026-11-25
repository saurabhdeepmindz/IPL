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
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/auth/services/auth.service.ts
 * @lld-synced     v0.23
 * @status         built
 */
import { api } from '@/lib/api-client';
import { setAccessToken } from '@/lib/token';

/**
 * Development sign-in. In plain words: signs in with an employee code and a company through `POST /dev/sign-in` (the API exists only in dev and test), keeps the token in memory and reads the session user from `GET /dev/whoami`.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.23 §6.5
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
