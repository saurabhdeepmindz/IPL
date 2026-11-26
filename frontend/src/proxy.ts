/**
 * @file    proxy.ts
 * @module  Routing
 *
 * @description
 * Route gating for the whole app. In plain words: a visitor with no session marker is sent to /login. The marker (`ams_session`) is set by the back end at sign-in; the front end never sets it (Standard section 9.5).
 * This is a convenience, not security: the API checks every call itself.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-02
 */

import { NextResponse, type NextRequest } from 'next/server';
import { isPublic } from '@/constants/routes';

export const SESSION_COOKIE = 'ams_session';

const ALWAYS_OPEN = ['/_next', '/favicon.ico'];

/**
 * Route policy of the web app.
 *
 * In plain words: a visitor with no session marker is sent to /login and the page asked for is remembered (`?next=`); a signed-in user who opens /login is sent on to /choose-work. `/login?dev=1` (the development form) is never redirected.
 *
 * @story US-LGN01-008
 * @subtask ST-LGN01-008-FE-02
 * @ac AC-US-LGN01-008-01, AC-US-LGN01-008-02
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname, search, searchParams } = request.nextUrl;
  if (ALWAYS_OPEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();
  const signedIn = request.cookies.has(SESSION_COOKIE);
  if (isPublic(pathname)) {
    if (signedIn && pathname === '/login' && !searchParams.has('dev')) {
      const url = request.nextUrl.clone();
      url.pathname = '/choose-work';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  if (signedIn) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'] };
