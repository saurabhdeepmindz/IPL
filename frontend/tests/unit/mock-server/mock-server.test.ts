/**
 * @file    mock-server.test.ts
 * @module  MockServer
 *
 * @description
 * Supporting tests of ST-ADM01-000-FE-03 for the contract mock server, written before the code. In plain words: every contract answers, every documented error code can be asked for, and the mock works with the real API client.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import { describe, expect, it } from 'vitest';
import { createApiClient } from '@/lib/api-client';
import { ApiError } from '@/lib/errors';
import { CONTRACTS } from './contracts';
import { createMockAdapter, MOCK_ERROR_HEADER } from './mock-adapter';
import contractsFromStories from './stories-contracts.json';

const client = () => createApiClient(createMockAdapter());
const concrete = (path: string) => path.replace(/\{[^}]+\}/g, 'x1');

describe('ST-ADM01-000-FE-03 contract mock server', () => {
  it('knows the 17 HTTP contracts of the epic (API-USR-09 is an internal call)', () => {
    const http = (contractsFromStories as { id: string; path: string }[]).filter((c) => c.path.startsWith('/api/v1/'));
    expect(CONTRACTS.map((c) => c.id).sort()).toEqual(http.map((c) => c.id).sort());
  });

  it('uses the method and path written in the Stories document', () => {
    for (const s of contractsFromStories as { id: string; method: string; path: string }[]) {
      const c = CONTRACTS.find((x) => x.id === s.id);
      if (!c) continue;
      expect(`${c.method} /api/v1${c.path}`).toBe(`${s.method} ${s.path}`);
    }
  });

  it('documents every error status that the Stories document lists', () => {
    for (const s of contractsFromStories as { id: string; errorStatuses: string[] }[]) {
      const c = CONTRACTS.find((x) => x.id === s.id);
      if (!c) continue;
      const mine = new Set(c.errors.map((e) => String(e.status)));
      for (const status of s.errorStatuses) expect(mine, `${s.id} ${status}`).toContain(status);
    }
  });

  it.each(CONTRACTS)('$id answers its success response', async (c) => {
    const res = await client().request({ method: c.method, url: concrete(c.path) });
    expect(res.status).toBe(c.successStatus);
    expect(res.data).toEqual({ data: c.success });
  });

  const everyError = CONTRACTS.flatMap((c) => c.errors.map((e) => ({ id: c.id, method: c.method, path: c.path, ...e })));
  it.each(everyError)('$id returns $status $code when asked', async (e) => {
    const err = (await client()
      .request({ method: e.method, url: concrete(e.path), headers: { [MOCK_ERROR_HEADER]: e.code } })
      .catch((x: unknown) => x)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(e.status);
    expect(err.code).toBe(e.code);
  });

  it('a 422 from the mock lists a field the form can show', async () => {
    const err = (await client().post('/users', {}, { headers: { [MOCK_ERROR_HEADER]: '422' } }).catch((x: unknown) => x)) as ApiError;
    expect(err.fields).toHaveProperty('email');
  });

  it('a route that is not a contract answers 404 NOT_FOUND', async () => {
    const err = (await client().get('/nothing').catch((x: unknown) => x)) as ApiError;
    expect(err.code).toBe('NOT_FOUND');
  });

  it('asking for an error the contract does not document is reported as a mock error', async () => {
    const err = (await client().get('/roles', { headers: { [MOCK_ERROR_HEADER]: 'USER_NOT_FOUND' } }).catch((x: unknown) => x)) as ApiError;
    expect(err.code).toBe('MOCK_UNDOCUMENTED_ERROR');
  });
});
