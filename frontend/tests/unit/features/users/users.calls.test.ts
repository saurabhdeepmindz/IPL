/**
 * @file    users.calls.test.ts
 * @module  Tests
 *
 * @description
 * Vitest supporting tests of the user and masters calls. In plain words: each function calls the right path and body, the Idempotency-Key header is sent, and error codes reach the caller.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002, US-ADM01-004
 * @subtask        ST-ADM01-002-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users/users.calls.test.ts
 * @lld-synced     v0.24
 * @status         built
 */

import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ApiClient from '@/lib/api-client';
import type { ApiError } from '@/lib/errors';
import { getCompanies, getDepartments, getDesignations } from '@/features/users/services/masters.service';
import { createUser, getUser, listUsers, updateUser } from '@/features/users/services/users.service';

const seen = vi.hoisted(() => ({ calls: [] as { method?: string; url?: string; params?: unknown; data?: unknown; headers?: Record<string, unknown> }[], next: { status: 200, data: {} as unknown } }));
vi.mock('@/lib/api-client', async () => {
  const real = await vi.importActual<typeof ApiClient>('@/lib/api-client');
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    seen.calls.push({ method: config.method, url: config.url, params: config.params, data: config.data ? JSON.parse(config.data as string) : undefined, headers: config.headers.toJSON() as Record<string, unknown> });
    const res: AxiosResponse = { data: seen.next.data, status: seen.next.status, statusText: '', headers: {}, config };
    return seen.next.status < 300 ? Promise.resolve(res) : Promise.reject(Object.assign(new Error('x'), { isAxiosError: true, response: res, config }));
  };
  return { ...real, api: real.createApiClient(adapter) };
});

const answer = (status: number, data: unknown) => {
  seen.next = { status, data };
};
const failure = (status: number, code: string, fields: { field: string; message: string }[] = []) => answer(status, { error: { code, message: code, fields } });
const caught = async (p: Promise<unknown>): Promise<ApiError> => p.then(() => { throw new Error('should have failed'); }, (e: unknown) => e as ApiError);
const form = { employeeCode: '20001', fullName: 'New Person', email: 'new@example.invalid', departmentId: 'd1', designationId: 'g1', reportingManagerCode: '10050', signIn: 'LOCAL' as const, companies: [{ companyCode: 'IPL', roleIds: ['r1'], validFrom: '2026-12-01' }] };

describe('user and masters calls (supporting tests)', () => {
  beforeEach(() => {
    seen.calls.length = 0;
  });

  /**
   * @story   US-ADM01-002
   * @ac      AC-US002-01
   * @subtask ST-ADM01-002-FE-01
   * In plain words: supporting test. listUsers sends the filters, drops empty values and returns the page with the counts.
   */
  it('lists users with the filters and drops empty values', async () => {
    answer(200, { data: { items: [{ employeeCode: '10001' }], counts: { all: 3, active: 3, inactive: 0, locked: 0 }, page: 1, pageSize: 25, total: 3 } });
    const out = await listUsers({ status: 'active', q: 'kum', departmentId: '', roleId: undefined, signIn: 'LOCAL', page: 2 });
    expect(seen.calls[0]).toMatchObject({ method: 'get', url: '/users', params: { status: 'active', q: 'kum', signIn: 'LOCAL', page: 2 } });
    expect(seen.calls[0].params).not.toHaveProperty('departmentId');
    expect(seen.calls[0].params).not.toHaveProperty('roleId');
    expect(out.counts.all).toBe(3);
  });

  /**
   * @story   US-ADM01-004
   * @ac      AC-US004-01
   * @subtask ST-ADM01-004-FE-01
   * In plain words: supporting test. getUser, createUser (with the Idempotency-Key header) and updateUser call the right paths with the right bodies.
   */
  it('reads, creates and changes a user', async () => {
    answer(200, { data: { employeeCode: '20001', firstSignInAt: null } });
    expect((await getUser('20001')).employeeCode).toBe('20001');
    expect(seen.calls[0]).toMatchObject({ method: 'get', url: '/users/20001' });
    answer(201, { data: { employeeCode: '20001', status: 'ACTIVE', oneTimePassword: { required: true, emailStatus: 'SENT' } } });
    const made = await createUser(form, 'key-1');
    expect(made.oneTimePassword.emailStatus).toBe('SENT');
    expect(seen.calls[1]).toMatchObject({ method: 'post', url: '/users', data: form });
    expect(seen.calls[1].headers).toMatchObject({ 'Idempotency-Key': 'key-1' });
    answer(200, { data: { employeeCode: '20009' } });
    await updateUser('20001', { ...form, newEmployeeCode: '20009' });
    expect(seen.calls[2]).toMatchObject({ method: 'put', url: '/users/20001', data: { newEmployeeCode: '20009' } });
  });

  /**
   * @story   US-ADM01-002
   * @ac      AC-US002-02
   * @subtask ST-ADM01-002-FE-01
   * In plain words: supporting test. The three masters reads call their paths and return the lists; the companies answer keeps `canViewAll`.
   */
  it('reads the masters', async () => {
    answer(200, { data: { items: [{ id: 'd1', code: 'FIN', name: 'Finance' }] } });
    expect(await getDepartments()).toEqual([{ id: 'd1', code: 'FIN', name: 'Finance' }]);
    answer(200, { data: { items: [{ id: 'g1', code: 'AGM', name: 'AGM', isHighest: true }] } });
    expect((await getDesignations())[0].isHighest).toBe(true);
    answer(200, { data: { items: [{ code: 'IPL', name: 'Indian Potash' }], canViewAll: true } });
    expect(await getCompanies()).toEqual({ items: [{ code: 'IPL', name: 'Indian Potash' }], canViewAll: true });
    expect(seen.calls.map((c) => c.url)).toEqual(['/masters/departments', '/masters/designations', '/masters/companies']);
  });

  /**
   * @story   US-ADM01-004
   * @ac      AC-US004-02
   * @subtask ST-ADM01-004-FE-01
   * In plain words: supporting test. DUPLICATE_EMPLOYEE_CODE, DUPLICATE_EMAIL, EMPLOYEE_CODE_READ_ONLY and 403 reach the caller with their status, code and fields.
   */
  it('maps the error codes of the contracts', async () => {
    failure(409, 'DUPLICATE_EMPLOYEE_CODE');
    expect(await caught(createUser(form, 'k'))).toMatchObject({ status: 409, code: 'DUPLICATE_EMPLOYEE_CODE' });
    failure(409, 'DUPLICATE_EMAIL');
    expect(await caught(createUser(form, 'k'))).toMatchObject({ status: 409, code: 'DUPLICATE_EMAIL' });
    failure(422, 'EMPLOYEE_CODE_READ_ONLY');
    expect(await caught(updateUser('20001', form))).toMatchObject({ status: 422, code: 'EMPLOYEE_CODE_READ_ONLY' });
    failure(403, 'FORBIDDEN');
    expect(await caught(listUsers({}))).toMatchObject({ status: 403, code: 'FORBIDDEN' });
  });
});
