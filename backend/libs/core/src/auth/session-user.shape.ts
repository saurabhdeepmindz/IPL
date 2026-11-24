/**
 * @file    session-user.shape.ts
 * @module  CoreModule
 *
 * @description
 * The shape of the signed-in user as the stand-in sign-in builds it. In plain words: it has the same four fields as SessionUser of the authorization pseudo-code; when US-ADM01-017 copies that interface in, this type is replaced by it (TBD-ADM01-02).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-06
 */

/**
 * The signed-in user.
 *
 * In plain words: who is calling, in which company, and which department they work in.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export interface SessionUserShape {
  /** Internal key of the user (UUID). */
  userId: string;
  /** The five-digit employee code shown on screens. */
  employeeCode: string;
  /** The company chosen at sign-in; every call is tied to it. */
  companyCode: string;
  /** Home department; needed for the DEPARTMENT data scope. */
  departmentId: string | null;
}

/** What the access token carries. */
export interface AccessClaims {
  sub: string;
  emp: string;
  company: string;
  dept: string | null;
}
