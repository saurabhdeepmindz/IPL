/**
 * @file    roles.service.test.ts
 * @module  Tests
 *
 * @description
 * Vitest supporting tests of the role calls (written before the code). In plain words: each function calls the right path with the right body and query, and an error answer reaches the caller as an ApiError with its code and fields (contracts API-ROL-01 to 04 and API-PRM-01).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012, US-ADM01-013
 * @subtask        ST-ADM01-012-FE-01, ST-ADM01-013-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/roles/roles.service.test.ts
 * @lld-synced     v0.24
 * @status         built
 */

import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ApiClient from '@/lib/api-client';
import type { ApiError } from '@/lib/errors';
import { assignUsers, createRole, deactivateRole, getPermissionCatalog, getRole, listRoles, updateRole } from '@/features/roles/services/roles.service';

const seen = vi.hoisted(() => ({ calls: [] as { method?: string; url?: string; params?: unknown; data?: unknown }[], next: { status: 200, data: {} as unknown } }));
vi.mock('@/lib/api-client', async () => {
  const real = await vi.importActual<typeof ApiClient>('@/lib/api-client');
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    seen.calls.push({ method: config.method, url: config.url, params: config.params, data: config.data ? JSON.parse(config.data as string) : undefined });
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

describe('role calls (supporting tests)', () => {
  beforeEach(() => {
    seen.calls.length = 0;
  });

  /**
   * @story   US-ADM01-012
   * @ac      AC-US012-01
   * @subtask ST-ADM01-012-FE-01
   * In plain words: supporting test. listRoles sends the type, status and search as the query and returns the roles.
   */
  it('lists roles with the filters as the query', async () => {
    answer(200, { data: { items: [{ roleId: 'r1', name: 'Initiator' }] } });
    const out = await listRoles({ type: 'CUSTOM', status: 'ACTIVE', q: 'plant' });
    expect(seen.calls[0]).toMatchObject({ method: 'get', url: '/roles', params: { type: 'CUSTOM', status: 'ACTIVE', q: 'plant' } });
    expect(out.items).toHaveLength(1);
  });

  /**
   * @story   US-ADM01-012
   * @ac      AC-US012-02
   * @subtask ST-ADM01-012-FE-01
   * In plain words: supporting test. The permission catalog groups the permissions by module, marks a permission as scoped when a cell has a scope, and gives the cells of each role with their locked flag.
   */
  it('reads the permission catalog from the matrix', async () => {
    answer(200, { data: { matrixVersion: 'v1', roles: [{ roleId: 'r1', name: 'Initiator', userCount: 3 }], groups: [
      { module: 'Users', permissions: [{ key: 'users.view', label: 'View users', hint: 'See the list', cells: { r1: { allowed: true, scope: 'COMPANY', locked: false } } }, { key: 'users.manage', label: 'Manage users', hint: '', cells: { r1: { allowed: false, scope: null, locked: true } } }] },
    ] } });
    const cat = await getPermissionCatalog();
    expect(seen.calls[0]).toMatchObject({ method: 'get', url: '/roles/permissions/matrix' });
    expect(cat.modules).toEqual([{ name: 'Users', permissions: [{ key: 'users.view', label: 'View users', hint: 'See the list', scoped: true }, { key: 'users.manage', label: 'Manage users', hint: '', scoped: false }] }]);
    expect(cat.cellsByRole.r1['users.manage']).toEqual({ allowed: false, scope: null, locked: true });
  });

  /**
   * @story   US-ADM01-012
   * @ac      AC-US012-02
   * @subtask ST-ADM01-012-FE-01
   * In plain words: supporting test. createRole posts the fields with the reason and returns the new role id; changing a role puts to the role path.
   */
  it('creates and changes a role', async () => {
    const input = { name: 'Plant Head', description: 'Plant', status: 'ACTIVE' as const, permissions: [{ permissionKey: 'users.view', allowed: true, scope: 'COMPANY' as const }], reason: 'New role' };
    answer(201, { data: { roleId: 'r9' } });
    expect(await createRole(input)).toEqual({ roleId: 'r9' });
    expect(seen.calls[0]).toMatchObject({ method: 'post', url: '/roles', data: input });
    answer(200, { data: { roleId: 'r9', name: 'Plant Head' } });
    await updateRole('r9', input);
    expect(seen.calls[1]).toMatchObject({ method: 'put', url: '/roles/r9', data: input });
  });

  /**
   * @story   US-ADM01-012
   * @ac      AC-US012-05
   * @subtask ST-ADM01-012-FE-01
   * In plain words: supporting test. deactivateRole posts the reason to the role path.
   */
  it('deactivates a role with the reason', async () => {
    answer(200, { data: { status: 'INACTIVE' } });
    await deactivateRole('r9', 'Not needed');
    expect(seen.calls[0]).toMatchObject({ method: 'post', url: '/roles/r9/deactivate', data: { reason: 'Not needed' } });
  });

  /**
   * @story   US-ADM01-012
   * @ac      AC-US012-03
   * @subtask ST-ADM01-012-FE-01
   * In plain words: supporting test. ROLE_NAME_EXISTS, ROLE_LOCKED, ROLE_IN_USE (with the count) and a 404 reach the caller as an ApiError with the status, the code and the fields.
   */
  it('maps the error codes of the contracts', async () => {
    const input = { name: 'X', description: 'Y', status: 'ACTIVE' as const, reason: 'r' };
    failure(409, 'ROLE_NAME_EXISTS', [{ field: 'name', message: 'Name is used' }]);
    expect(await caught(createRole(input))).toMatchObject({ status: 409, code: 'ROLE_NAME_EXISTS', fields: { name: 'Name is used' } });
    failure(403, 'ROLE_LOCKED');
    expect(await caught(updateRole('r1', input))).toMatchObject({ status: 403, code: 'ROLE_LOCKED' });
    failure(409, 'ROLE_IN_USE', [{ field: 'userCount', message: '4' }]);
    expect(await caught(deactivateRole('r1', 'r'))).toMatchObject({ status: 409, code: 'ROLE_IN_USE', fields: { userCount: '4' } });
    failure(404, 'ROLE_NOT_FOUND');
    expect(await caught(updateRole('nope', input))).toMatchObject({ status: 404, code: 'ROLE_NOT_FOUND' });
  });

  /**
   * @story   US-ADM01-013
   * @ac      AC-US013-01
   * @subtask ST-ADM01-013-FE-01
   * In plain words: supporting test. getRole asks for the role with the company filter and returns its holders and what it allows.
   */
  it('reads a role with its holders', async () => {
    answer(200, { data: { roleId: 'r1', name: 'Processor', users: [{ employeeCode: '10234', name: 'R. Sharma', department: 'Operations', company: 'IPL', assignedOn: '2026-04-01' }], allows: [{ permission: 'users.view', scope: 'OWN' }] } });
    const out = await getRole('r1', 'IPL');
    expect(seen.calls[0]).toMatchObject({ method: 'get', url: '/roles/r1', params: { companyCode: 'IPL' } });
    expect(out.users[0].employeeCode).toBe('10234');
    expect(out.allows).toEqual([{ permission: 'users.view', scope: 'OWN' }]);
  });

  /**
   * @story   US-ADM01-013
   * @ac      AC-US013-01
   * @subtask ST-ADM01-013-FE-01
   * In plain words: supporting test. assignUsers posts the codes, company, first day and reason, and returns how many were assigned; ROLE_INACTIVE, ROLE_NOT_FOUND and USER_NOT_FOUND reach the caller.
   */
  it('assigns users and maps the errors', async () => {
    const input = { employeeCodes: ['10234', '10388'], companyCode: 'IPL', validFrom: '2026-12-01', reason: 'New plant team' };
    answer(200, { data: { assigned: 2 } });
    expect(await assignUsers('r1', input)).toEqual({ assigned: 2 });
    expect(seen.calls[0]).toMatchObject({ method: 'post', url: '/roles/r1/users', data: input });
    failure(422, 'ROLE_INACTIVE');
    expect(await caught(assignUsers('r1', input))).toMatchObject({ status: 422, code: 'ROLE_INACTIVE' });
    failure(404, 'USER_NOT_FOUND');
    expect(await caught(assignUsers('r1', input))).toMatchObject({ status: 404, code: 'USER_NOT_FOUND' });
    failure(404, 'ROLE_NOT_FOUND');
    expect(await caught(getRole('nope'))).toMatchObject({ status: 404, code: 'ROLE_NOT_FOUND' });
  });
});
