/**
 * @file    users.service.ts
 * @module  UsersFeature
 *
 * @description
 * User API functions. In plain words: the user search used by the assign dialog (API-USR-01). The rest of the users feature comes with its own stories.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002, US-ADM01-004, US-ADM01-013
 * @subtask        ST-ADM01-002-FE-01, ST-ADM01-004-FE-01, ST-ADM01-013-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/services/users.service.ts
 * @lld-synced     v0.29
 * @status         built
 */
import { api } from '@/lib/api-client';
import type { ApiError } from '@/lib/errors';
import type { CreateUserResult, DeactivateInput, EmailStatus, HoldsProposals, UserDetails, UserFilters, UserFormData, UserList } from '../types/user.types';

/**
 * List users. In plain words: one page of users with the counts of the four tabs; the filters go in the query and empty ones are dropped. It also serves the user search of the assign dialog (`q` and `pageSize` only).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-01
 * @ac        AC-US002-01, AC-US002-02
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies api.get
 *
 * @returns The page of users and the counts
 */
export async function listUsers(query: UserFilters): Promise<UserList> {
  const params = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ''));
  const res = await api.get<{ data: UserList }>('/users', { params });
  return res.data.data;
}

/**
 * Read one user. In plain words: the user for the edit form.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-03
 * @ac        AC-US004-04
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies api.get
 *
 * @returns The user details
 */
export async function getUser(employeeCode: string): Promise<UserDetails> {
  const res = await api.get<{ data: UserDetails }>(`/users/${employeeCode}`);
  return res.data.data;
}

/**
 * Create a user. In plain words: sends the form with an Idempotency-Key; a used code or e-mail gives 409 with the field.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-02
 * @ac        AC-US004-01, AC-US004-02
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies api.post
 *
 * @returns The create result
 */
export async function createUser(input: UserFormData, idempotencyKey: string): Promise<CreateUserResult> {
  const res = await api.post<{ data: CreateUserResult }>('/users', input, { headers: { 'Idempotency-Key': idempotencyKey } });
  return res.data.data;
}

/**
 * Change a user. In plain words: sends the form to the user path; `newEmployeeCode` only before the first sign-in.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-04
 * @ac        AC-US004-04
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies api.put
 *
 * @returns The saved user
 */
export async function updateUser(employeeCode: string, input: UserFormData): Promise<UserDetails> {
  const res = await api.put<{ data: UserDetails }>(`/users/${employeeCode}`, input);
  return res.data.data;
}

/**
 * Deactivate a user. In plain words: sends the reason, the note and, after the warning, the confirmation; the user is never deleted.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-006
 * @subtask   ST-ADM01-006-FE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-05
 * @ac        AC-US006-01, AC-US006-02
 * @lld       LLD-EPIC-ADM-01 v0.25 §6.3
 * @status    built
 *
 * @dependencies api.post
 *
 * @returns The new status
 */
export async function deactivateUser(employeeCode: string, input: DeactivateInput): Promise<{ status: 'INACTIVE' }> {
  const res = await api.post<{ data: { status: 'INACTIVE' } }>(`/users/${employeeCode}/deactivate`, input);
  return res.data.data;
}

/**
 * Read the proposals warning. In plain words: turns the fields of a 409 HOLDS_PROPOSALS into the count, the Workflow Monitor address and the delegate flag; any other error gives null.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-006
 * @subtask   ST-ADM01-006-FE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-05
 * @ac        AC-US006-02
 * @lld       LLD-EPIC-ADM-01 v0.25 §6.3
 * @status    built
 *
 * @param error - the error of the deactivate call
 * @returns The warning, or null
 */
export function readHolds(error: ApiError): HoldsProposals | null {
  if (error.code !== 'HOLDS_PROPOSALS') return null;
  return { count: Number(error.fields.count ?? 0), workflowMonitorUrl: error.fields.workflowMonitorUrl ?? '', hasDelegate: error.fields.hasDelegate === 'true' };
}

/**
 * Unlock a user. In plain words: unlocks a Locked user; the answer is the new status.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-008
 * @subtask   ST-ADM01-008-FE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-06
 * @ac        AC-US008-01
 * @lld       LLD-EPIC-ADM-01 v0.26 §6.3
 * @status    built
 *
 * @dependencies api.post
 *
 * @param employeeCode - the user
 * @returns The new status
 */
export async function unlockUser(employeeCode: string): Promise<{ status: 'ACTIVE' }> {
  const res = await api.post<{ data: { status: 'ACTIVE' } }>(`/users/${employeeCode}/unlock`);
  return res.data.data;
}

/**
 * Reset a password. In plain words: e-mails a new one-time password to a local user; the answer is the e-mail status.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-008
 * @subtask   ST-ADM01-008-FE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-07
 * @ac        AC-US008-02
 * @lld       LLD-EPIC-ADM-01 v0.26 §6.3
 * @status    built
 *
 * @dependencies api.post
 *
 * @param employeeCode - the user
 * @returns SENT or FAILED
 */
export async function resetUserPassword(employeeCode: string): Promise<{ emailStatus: EmailStatus }> {
  const res = await api.post<{ data: { emailStatus: EmailStatus } }>(`/users/${employeeCode}/reset-password`);
  return res.data.data;
}

/**
 * Resend the one-time password. In plain words: e-mails the one-time password again to a local user who has not signed in; the answer is the e-mail status.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-008
 * @subtask   ST-ADM01-008-FE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-08
 * @ac        AC-US008-03
 * @lld       LLD-EPIC-ADM-01 v0.26 §6.3
 * @status    built
 *
 * @dependencies api.post
 *
 * @param employeeCode - the user
 * @returns SENT or FAILED
 */
export async function resendOneTimePassword(employeeCode: string): Promise<{ emailStatus: EmailStatus }> {
  const res = await api.post<{ data: { emailStatus: EmailStatus } }>(`/users/${employeeCode}/one-time-password`);
  return res.data.data;
}
