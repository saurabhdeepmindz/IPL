/**
 * @file    session-user.interface.ts
 * @module  AuthorizationModule
 *
 * @description
 * The shape of the signed-in user that the guards read. In plain words: who is calling, in which company, and which department they belong to.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-017
 * @lld            LLD-EPIC-ADM-01 v0.22 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.22.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/session-user.interface.ts
 * @lld-synced     v0.22
 * @status         built
 */

import { DataScope } from '@libs/database';

/**
 * The signed-in user as the guards see them.
 *
 * In plain words: the sign-in service puts this on every request after it has
 * checked the token. The guards only read it.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.22 §6.8
 *
 * TBD-Future TBD-ADM01-02: the sign-in epic provides the real value. Until then a
 * development sign-in builds it for a seeded user (LLD §8.1).
 */
export interface SessionUser {
  /** Internal key of the user (UUID). */
  userId: string;
  /** The five-digit employee code shown on screens. */
  employeeCode: string;
  /** The company chosen at sign-in; every call is tied to it. */
  companyCode: string;
  /** Home department; needed for the DEPARTMENT data scope. */
  departmentId: string | null;
}

/**
 * The answer to "may this user do this?".
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.22 §6.8
 */
export interface ResolvedAccess {
  /** True when at least one valid role of the session company allows the permission. */
  allowed: boolean;
  /** The widest data scope among the roles that allow it; null when not scoped or not allowed. */
  scope: DataScope | null;
}

/** Metadata key under which `@RequirePermission` stores the permission key. */
export const REQUIRE_PERMISSION_KEY = 'ams:require-permission';

/** Metadata key under which `@Public` marks an open route. */
export const PUBLIC_ROUTE_KEY = 'ams:public-route';
