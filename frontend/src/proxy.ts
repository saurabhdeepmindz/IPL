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

/** Name of the marker cookie set by the back end. */
export const SESSION_COOKIE = 'ams_session';

const PUBLIC_PREFIXES = ['/login', '/forgot-password', '/_next', '/favicon.ico'];

/**
 * Decide whether a request may go on.
 *
 * In plain words: public pages always pass; other pages need the marker cookie.
 *
 * @param request The incoming request
 * @returns A redirect to /login, or the request unchanged
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'] };
