/**
 * @file    proxy.test.ts
 * @module  Routing
 *
 * @description
 * Supporting tests of ST-ADM01-000-FE-02 for route gating. In plain words: no marker means the sign-in page; the marker lets the visitor through; the login page is always open.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-02
 */
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy, SESSION_COOKIE } from './proxy';

const req = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost:3001${path}`, cookie ? { headers: { cookie } } : undefined);

describe('ST-ADM01-000-FE-02 route gating', () => {
  it('sends a visitor with no marker to /login', () => {
    const res = proxy(req('/users'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3001/login');
  });

  it('lets a visitor with the marker through', () => {
    const res = proxy(req('/users', `${SESSION_COOKIE}=1`));
    expect(res.headers.get('location')).toBeNull();
  });

  it('keeps the login page open', () => {
    expect(proxy(req('/login')).headers.get('location')).toBeNull();
  });
});
