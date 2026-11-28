/**
 * @file    session-cookie.util.ts
 * @module  AuthModule
 *
 * @description
 * Cookie helpers. In plain words: sets, reads and clears the secure, HTTP-only refresh cookie.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-003, US-LGN01-001
 * @subtask        ST-LGN01-003-BE-01
 * @contract       API-AUTH-04
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/apps/auth-apis/src/utils/session-cookie.util.ts
 * @lld-synced     v0.5
 * @status         built
 */

import type { Request, Response } from 'express';
import { readEnv } from '@config';

const REFRESH_COOKIE = 'ams_refresh';
const MARKER_COOKIE = 'ams_session';
const COOKIE_PATH = '/api/v1/auth';

function secure(): boolean {
  return !['dev', 'test'].includes(readEnv('APP_ENV', 'dev') ?? 'dev');
}

/**
 * Sets the refresh cookie and the signed-in marker.
 *
 * In plain words: `ams_refresh` is HTTP-only and only the Auth API path sees it; `ams_session` is a plain marker (no token) that the route policy of the web app reads (decision L-03).
 *
 * @ac AC-US-LGN01-003-01
 */
export function setRefreshCookie(res: Response, token: string, seconds: number): void {
  const common = { secure: secure(), sameSite: 'strict' as const, maxAge: seconds * 1000 };
  res.cookie(REFRESH_COOKIE, token, { ...common, httpOnly: true, path: COOKIE_PATH });
  res.cookie(MARKER_COOKIE, '1', { ...common, httpOnly: false, path: '/' });
}

/** Reads the refresh cookie from the request header, or undefined. */
export function readRefreshCookie(req: Request): string | undefined {
  const header = req.headers.cookie ?? '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === REFRESH_COOKIE) return decodeURIComponent(part.slice(i + 1).trim()) || undefined;
  }
  return undefined;
}

/** Clears both cookies with the attributes they were set with. */
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH, secure: secure(), sameSite: 'strict', httpOnly: true });
  res.clearCookie(MARKER_COOKIE, { path: '/', secure: secure(), sameSite: 'strict' });
}
