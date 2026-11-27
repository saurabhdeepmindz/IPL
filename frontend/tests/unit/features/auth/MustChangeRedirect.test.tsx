/**
 * @file    MustChangeRedirect.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest supporting test of the must-change redirect (decision S-2 of EPIC-LGN-02). In plain words: when an API answers 403 MUST_CHANGE_PASSWORD on any page, the app moves the user to /choose-password without a reload; on that page itself it does nothing.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-008
 * @subtask        ST-LGN02-008-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.5
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/unit/features/auth/MustChangeRedirect.test.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MustChangeRedirect } from '@/features/auth/components/MustChangeRedirect';
import { createApiClient } from '@/lib/api-client';

const replace = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const mustChange: AxiosAdapter = (config: InternalAxiosRequestConfig) =>
  Promise.reject({ config, response: { status: 403, statusText: '', headers: {}, config, data: { error: { code: 'MUST_CHANGE_PASSWORD', message: 'x', fields: [], details: {} } } } });

describe('MustChangeRedirect (US-LGN02-008)', () => {
  afterEach(() => {
    replace.mockClear();
    window.history.pushState({}, '', '/');
  });

  /** @story US-LGN02-008 @ac AC-US-LGN02-008-01 @subtask ST-LGN02-008-FE-02 In plain words: supporting test. */
  it('moves the user to /choose-password when an API answers MUST_CHANGE_PASSWORD on another page', async () => {
    window.history.pushState({}, '', '/users');
    const view = render(<MustChangeRedirect />);
    await createApiClient(mustChange).get('/users').catch(() => undefined);
    expect(replace).toHaveBeenCalledWith('/choose-password');
    view.unmount();
    await createApiClient(mustChange).get('/users').catch(() => undefined);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  /** @story US-LGN02-008 @ac AC-US-LGN02-008-01 @subtask ST-LGN02-008-FE-02 In plain words: supporting test. */
  it('does nothing on the change page itself', async () => {
    window.history.pushState({}, '', '/choose-password');
    render(<MustChangeRedirect />);
    await createApiClient(mustChange).get('/users').catch(() => undefined);
    expect(replace).not.toHaveBeenCalled();
  });
});
