/**
 * @file    role-inactive.exception.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Typed error. In plain words: the role is not Active, so nobody can be given it (HTTP 422).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/errors/role-inactive.exception.ts
 * @lld-synced     v0.24
 * @status         built
 */

import { ValidationFailedException } from '@libs/common';

/**
 * RoleInactiveException.
 *
 * In plain words: the role is not Active, so nobody can be given it (HTTP 422).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.24 §6.4
 */
export class RoleInactiveException extends ValidationFailedException {
  constructor() {
    super([{ field: 'roleId', message: 'The role is not active' }], 'The role is not active', 'ROLE_INACTIVE');
  }
}
