/**
 * @file    routes.ts
 * @module  Auth
 *
 * @description
 * Route policy. In plain words: every route with its access rule, read by the request proxy.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-008, US-LGN01-005
 * @subtask        ST-LGN01-008-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/constants/routes.ts
 * @lld-synced     v0.5
 * @status         built
 */

export const PUBLIC_ROUTES = ['/login', '/signing-in', '/forgot-password', '/set-password', '/choose-password', '/session-ended', '/signed-out'] as const;
export const SIGNED_IN_ROUTES = ['/choose-work', '/no-company-access', '/dashboard', '/users', '/roles', '/permissions'] as const;

/**
 * Tells whether a page is open to a visitor with no session.
 *
 * In plain words: true when the path is a public route or sits below one (`/login/x`, not `/loginx`).
 *
 * @story US-LGN01-008
 * @subtask ST-LGN01-008-FE-02
 * @ac AC-US-LGN01-008-01
 */
export function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
