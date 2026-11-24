/**
 * @file    mock-adapter.ts
 * @module  MockServer
 *
 * @description
 * An Axios adapter that answers the contracts without a back end. In plain words: plug it into createApiClient in a test; send the header x-mock-error with a status or an error code to get that documented error.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { CONTRACTS, type MockContract } from './contracts';

/** Header a test sets to ask for a documented error, for example `404` or `USER_NOT_FOUND`. */
export const MOCK_ERROR_HEADER = 'x-mock-error';

const toPattern = (path: string): RegExp => new RegExp(`^${path.replace(/\{[^}]+\}/g, '[^/]+')}$`);

/**
 * Find the contract for a request.
 *
 * In plain words: matches the method and the path (parameters like {employeeCode} match any one segment).
 *
 * @param method HTTP method
 * @param path Path under /api/v1, query string removed
 * @returns The contract, or undefined
 */
export function findContract(method: string, path: string): MockContract | undefined {
  const upper = method.toUpperCase();
  const matches = CONTRACTS.filter((c) => c.method === upper && toPattern(c.path).test(path));
  // A fixed path such as /roles/permissions/matrix wins over /roles/{roleId}.
  return matches.sort((a, b) => b.path.replace(/\{[^}]+\}/g, '').length - a.path.replace(/\{[^}]+\}/g, '').length)[0];
}

const failureBody = (code: string, extra: Record<string, unknown> = {}) => ({
  error: { code, message: `Mock: ${code}`, fields: code === 'VALIDATION_FAILED' ? [{ field: 'email', message: 'must be an e-mail' }] : [], ...extra },
});

/**
 * Build the mock adapter.
 *
 * In plain words: success by default; an error when the header asks for one; 404 NOT_FOUND for a route that is not a contract.
 *
 * @returns An Axios adapter
 */
export function createMockAdapter(): AxiosAdapter {
  return (config: InternalAxiosRequestConfig) => {
    const path = (config.url ?? '').split('?')[0];
    if (path === '/auth/refresh') {
      const ok: AxiosResponse = { data: { data: { accessToken: 'mock-access-token' } }, status: 200, statusText: '', headers: {}, config };
      return Promise.resolve(ok);
    }
    const contract = findContract(config.method ?? 'get', path);
    const ask = config.headers.get(MOCK_ERROR_HEADER) as string | undefined;
    let status = 404;
    let data: unknown = failureBody('NOT_FOUND');
    if (contract) {
      const wanted = ask ? contract.errors.find((e) => e.code === ask || String(e.status) === ask) : undefined;
      if (ask && !wanted) {
        status = 500;
        data = failureBody('MOCK_UNDOCUMENTED_ERROR');
      } else if (wanted) {
        status = wanted.status;
        data = failureBody(wanted.code, wanted.extra);
      } else {
        status = contract.successStatus;
        data = { data: contract.success };
      }
    }
    const response: AxiosResponse = { data, status, statusText: '', headers: {}, config };
    return status < 300
      ? Promise.resolve(response)
      : Promise.reject(Object.assign(new Error(`Mock ${status}`), { isAxiosError: true, response, config }));
  };
}
