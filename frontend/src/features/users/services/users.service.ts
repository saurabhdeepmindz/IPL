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
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/services/users.service.ts
 * @lld-synced     v0.24
 * @status         built
 */
import { api } from '@/lib/api-client';
import type { CreateUserResult, UserDetails, UserFilters, UserFormData, UserList } from '../types/user.types';

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
