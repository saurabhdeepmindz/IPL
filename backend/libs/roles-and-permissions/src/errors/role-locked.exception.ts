/**
 * @file    role-locked.exception.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Typed error. In plain words: a change would remove a protected right of the Administrator role, or deactivate it (HTTP 403).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/errors/role-locked.exception.ts
 * @lld-synced     v0.25
 * @status         built
 */

import { ForbiddenAppException } from '@libs/common';

/**
 * RoleLockedException.
 *
 * In plain words: a change would remove a protected right of the Administrator role, or deactivate it (HTTP 403).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-02, API-ROL-03, API-ROL-04
 *   lld:       LLD-EPIC-ADM-01 v0.25 §6.4
 */
export class RoleLockedException extends ForbiddenAppException {
  constructor(message: string) {
    super('ROLE_LOCKED', message);
  }
}
