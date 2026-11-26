/**
 * @file    routes.test.ts
 * @module  Tests
 *
 * @description
 * Vitest cases of US-LGN01-008 (Application sends visitors without a session to sign-in). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-008
 * @subtask        ST-LGN01-008-FE-01
 * @lld            LLD-EPIC-LGN-01 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/unit/constants/routes.test.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { isPublic } from '@/constants/routes';
import { proxy, SESSION_COOKIE } from '@/proxy';

const req = (path: string, cookie?: string) => new NextRequest(`http://localhost:3001${path}`, cookie ? { headers: { cookie } } : undefined);

describe('Application sends visitors without a session to sign-in (US-LGN01-008)', () => {
  /** @tc TC-LGN01-008-J01 @story US-LGN01-008 @ac AC-US-LGN01-008-01 @subtask ST-LGN01-008-FE-01 */
  it('TC-LGN01-008-J01 a protected page with no session goes to /login and remembers the page asked for', () => {
    const res = proxy(req('/users?tab=active'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3001/login?next=%2Fusers%3Ftab%3Dactive');
  });

  it('the public pages are open to everyone', () => {
    for (const p of ['/login', '/signing-in', '/forgot-password', '/set-password', '/choose-password', '/session-ended', '/signed-out']) {
      expect(isPublic(p)).toBe(true);
      expect(proxy(req(p)).headers.get('location')).toBeNull();
    }
    expect(isPublic('/login/x')).toBe(true);
    expect(isPublic('/loginx')).toBe(false);
    expect(isPublic('/users')).toBe(false);
  });

  /** @tc TC-LGN01-008-J02 @story US-LGN01-008 @ac AC-US-LGN01-008-02 @subtask ST-LGN01-008-FE-01 */
  it('TC-LGN01-008-J02 a signed-in user who opens /login is sent on to /choose-work', () => {
    const res = proxy(req('/login', `${SESSION_COOKIE}=1`));
    expect(res.headers.get('location')).toBe('http://localhost:3001/choose-work');
  });

  it('the development form (?dev=1) is not redirected, so the earlier journeys can switch users', () => {
    expect(proxy(req('/login?dev=1', `${SESSION_COOKIE}=1`)).headers.get('location')).toBeNull();
  });
});
