/**
 * @file    role-in-use.exception.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Typed error. In plain words: users still hold the role, so it cannot be deactivated (HTTP 409, with the user count).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.14 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.14.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/errors/role-in-use.exception.ts
 * @lld-synced     v0.14
 * @status         built
 */

import { ConflictAppException } from '@libs/common';

/**
 * RoleInUseException.
 *
 * In plain words: users still hold the role, so it cannot be deactivated (HTTP 409, with the user count).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-02, API-ROL-03, API-ROL-04
 *   lld:       LLD-EPIC-ADM-01 v0.14 §6.4
 */
export class RoleInUseException extends ConflictAppException {
  constructor(readonly userCount: number) {
    super('ROLE_IN_USE', `${userCount} user(s) hold this role`, [{ field: 'userCount', message: String(userCount) }]);
  }
}
