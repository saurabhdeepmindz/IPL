/**
 * @file    user-not-found.exception.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Typed error. In plain words: one or more employee codes are unknown or belong to an Inactive user; every such code is named (HTTP 404).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.13 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.13.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/errors/user-not-found.exception.ts
 * @lld-synced     v0.13
 * @status         built
 */

import { NotFoundAppException } from '@libs/common';

/**
 * UserNotFoundException.
 *
 * In plain words: one or more employee codes are unknown or belong to an Inactive user; every such code is named (HTTP 404).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.13 §6.4
 */
export class UserNotFoundException extends NotFoundAppException {
  constructor(readonly codes: string[]) {
    super('USER_NOT_FOUND', 'Some users do not exist or are not active', codes.map((c) => ({ field: 'employeeCodes', message: c })));
  }
}
