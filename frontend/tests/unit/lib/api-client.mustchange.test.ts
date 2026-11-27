/**
 * @file    api-client.mustchange.test.ts
 * @module  Tests
 *
 * @description
 * Vitest supporting test of the must-change redirect of the API client. In plain words: when an API answers 403 MUST_CHANGE_PASSWORD the registered handler runs once and the caller still gets the error; other errors do not run it.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-008
 * @subtask        ST-LGN02-008-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.4 §6.5
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.4.md
 * @lld-synced     v0.4
 * @status         built
 */

import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient, setMustChangeHandler } from '@/lib/api-client';
import { ApiError } from '@/lib/errors';

/** An adapter that answers every call with the given status and error code. */
const failing = (status: number, code: string): AxiosAdapter => (config: InternalAxiosRequestConfig) =>
  Promise.reject({ config, response: { status, statusText: '', headers: {}, config, data: { error: { code, message: 'x', fields: [], details: {} } } } });

describe('API client: users who must change the password (US-LGN02-008)', () => {
  afterEach(() => setMustChangeHandler(null));

  /** @story US-LGN02-008 @ac AC-US-LGN02-008-01 @subtask ST-LGN02-008-FE-02 In plain words: supporting test. */
  it('runs the handler on 403 MUST_CHANGE_PASSWORD and still throws the error', async () => {
    const handler = vi.fn();
    setMustChangeHandler(handler);
    const client = createApiClient(failing(403, 'MUST_CHANGE_PASSWORD'));
    const error = await client.get('/users').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 403, code: 'MUST_CHANGE_PASSWORD' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  /** @story US-LGN02-008 @ac AC-US-LGN02-008-01 @subtask ST-LGN02-008-FE-02 In plain words: supporting test. */
  it('does not run the handler for other errors, and a missing handler is no problem', async () => {
    const handler = vi.fn();
    setMustChangeHandler(handler);
    await createApiClient(failing(403, 'FORBIDDEN')).get('/users').catch(() => undefined);
    expect(handler).not.toHaveBeenCalled();
    setMustChangeHandler(null);
    await expect(createApiClient(failing(403, 'MUST_CHANGE_PASSWORD')).get('/users')).rejects.toMatchObject({ code: 'MUST_CHANGE_PASSWORD' });
  });
});
