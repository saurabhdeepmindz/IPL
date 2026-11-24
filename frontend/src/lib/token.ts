/**
 * @file    token.ts
 * @module  ApiClient
 *
 * @description
 * Keeps the access token in memory only. In plain words: the token is lost when the tab closes, on purpose; it is never written to localStorage or sessionStorage (Standard section 9.5).
 * The refresh token is never seen here: the browser keeps it in an HTTP-only cookie.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-02
 */

let accessToken: string | null = null;

/**
 * Read the access token.
 *
 * In plain words: the short-lived token the API client attaches to calls.
 *
 * @returns The token, or null when signed out
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Keep a new access token.
 *
 * In plain words: remembers the token for this tab only.
 *
 * @param token The new access token
 */
export function setAccessToken(token: string): void {
  accessToken = token;
}

/**
 * Forget the access token.
 *
 * In plain words: used when the user signs out or the session ends.
 */
export function clearAccessToken(): void {
  accessToken = null;
}
