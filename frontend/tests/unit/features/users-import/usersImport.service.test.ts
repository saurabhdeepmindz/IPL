/**
 * @file    usersImport.service.test.ts
 * @module  Tests
 *
 * @description
 * Vitest tests of the two import calls and the sending in groups. Written before the code. The API client is replaced by a small adapter that records every call.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users-import/usersImport.service.test.ts
 * @lld-synced     v0.30
 * @status         built
 */

import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ApiClient from '@/lib/api-client';
import type { ApiError } from '@/lib/errors';
import { checkAll, importAll } from '@/features/users-import/services/usersImport.service';
import type { ImportRow } from '@/features/users-import/types/import.types';

type Call = { url?: string; rows: unknown[] };
const seen = vi.hoisted(() => ({ calls: [] as { url?: string; rows: unknown[] }[], reply: (_call: { url?: string; rows: unknown[] }, _n: number): { status: number; data: unknown } => ({ status: 200, data: {} }) }));
vi.mock('@/lib/api-client', async () => {
  const real = await vi.importActual<typeof ApiClient>('@/lib/api-client');
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    const call = { url: config.url, rows: (JSON.parse(config.data as string) as { rows: unknown[] }).rows };
    seen.calls.push(call);
    const { status, data } = seen.reply(call, seen.calls.length);
    const res: AxiosResponse = { data, status, statusText: '', headers: {}, config };
    return status < 300 ? Promise.resolve(res) : Promise.reject(Object.assign(new Error('x'), { isAxiosError: true, response: res, config }));
  };
  return { ...real, api: real.createApiClient(adapter) };
});

const rows = (n: number): ImportRow[] =>
  Array.from({ length: n }, (_, i) => ({
    excelRow: i + 2,
    cells: { 'Employee code': `${20000 + i}`, 'Full name': '', 'E-mail': `u${i}@example.invalid`, Mobile: '', 'Department code': 'IT', 'Designation code': 'SM', 'Reporting manager code': '10001', 'Sign-in type': 'LOCAL', 'Company code': 'IPL', 'Role names': 'Initiator', 'Valid from': '', 'Valid to': '' },
    input: { employeeCode: `${20000 + i}`, fullName: 'X', email: `u${i}@example.invalid`, departmentId: 'd1', designationId: 'g1', reportingManagerCode: '10001', signIn: 'LOCAL', companies: [{ companyCode: 'IPL', roleIds: ['r1'], validFrom: '2026-12-01' }] },
  }));
const caught = async (p: Promise<unknown>): Promise<ApiError> => p.then(() => { throw new Error('should have failed'); }, (e: unknown) => e as ApiError);

describe('US-ADM01-009 the import calls (supporting tests)', () => {
  beforeEach(() => {
    seen.calls.length = 0;
    seen.reply = () => ({ status: 200, data: { data: { checked: 0, failed: [] } } });
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-03
   * @subtask ST-ADM01-009-IN-04
   * In plain words: supporting test. 450 rows are checked as 200, 200 and 50 with a progress count after each group; a server problem becomes a table line with the Excel row of that row.
   */
  it('checks 450 rows in groups of 200 and reports the progress', async () => {
    seen.reply = (call, n) => ({ status: 200, data: { data: { checked: call.rows.length, failed: n === 2 ? [{ row: 3, field: 'email', message: 'The e-mail is already used' }] : [] } } });
    const progress: number[] = [];
    const problems = await checkAll(rows(450), (done) => progress.push(done));
    expect(seen.calls.map((c: Call) => [c.url, c.rows.length])).toEqual([['/users/import/check', 200], ['/users/import/check', 200], ['/users/import/check', 50]]);
    expect(progress).toEqual([200, 400, 450]);
    expect(problems).toEqual([{ excelRow: 204, column: 'E-mail', value: 'u202@example.invalid', message: 'The e-mail is already used' }]);
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-01
   * @subtask ST-ADM01-009-IN-04
   * In plain words: supporting test. The import sends the same groups to the import route and adds the created counts; a 422 BULK_IMPORT_FAILED of one group is that group's report (created 0), not an error of the whole import; any other error stops it.
   */
  it('imports in groups and adds the created counts', async () => {
    seen.reply = (call) => ({ status: 201, data: { data: { created: call.rows.length - 1, failed: [{ row: 1, field: 'email', message: 'The e-mail is already used' }] } } });
    const out = await importAll(rows(250));
    expect(seen.calls.map((c: Call) => [c.url, c.rows.length])).toEqual([['/users/import', 200], ['/users/import', 50]]);
    expect(out.created).toBe(199 + 49);
    expect(out.problems.map((p) => p.excelRow)).toEqual([2, 202]);
  });

  it('takes a group with no valid row as its report', async () => {
    seen.reply = (_call, n) =>
      n === 1
        ? { status: 422, data: { error: { code: 'BULK_IMPORT_FAILED', message: 'No row of the import is valid', fields: [{ field: 'rows.1.fullName', message: 'The name is required' }, { field: 'rows.2.email', message: 'Enter a valid e-mail address' }] } } }
        : { status: 201, data: { data: { created: 50, failed: [] } } };
    const out = await importAll(rows(250));
    expect(out.created).toBe(50);
    expect(out.problems.map((p) => `${p.excelRow}:${p.column}`)).toEqual(['2:Full name', '3:E-mail']);
  });

  it('stops on any other error', async () => {
    seen.reply = () => ({ status: 403, data: { error: { code: 'FORBIDDEN', message: 'You do not have access', fields: [] } } });
    const error = await caught(importAll(rows(10)));
    expect([error.status, error.code]).toEqual([403, 'FORBIDDEN']);
  });
});
