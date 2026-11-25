/**
 * @file    session-user.shape.ts
 * @module  CoreModule
 *
 * @description
 * The claims that the access token carries. In plain words: the small set of facts put in the token at sign-in. The signed-in user itself is `SessionUser` in the authorization folder (replaced the stand-in type on 25 Nov 2026).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-06
 */

/** What the access token carries. */
export interface AccessClaims {
  sub: string;
  emp: string;
  company: string;
  dept: string | null;
}
