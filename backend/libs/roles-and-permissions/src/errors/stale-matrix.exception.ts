/**
 * @file    stale-matrix.exception.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Typed error. In plain words: another administrator saved first; the screen must reload (HTTP 409).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.15 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.15.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/errors/stale-matrix.exception.ts
 * @lld-synced     v0.15
 * @status         built
 */

import { ConflictAppException } from '@libs/common';

/**
 * StaleMatrixException.
 *
 * In plain words: another administrator saved first; the screen must reload (HTTP 409).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-02, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.15 §6.6
 */
export class StaleMatrixException extends ConflictAppException {
  constructor() {
    super('STALE_MATRIX', 'Another administrator saved the matrix first. Reload and try again.');
  }
}
