/**
 * @file    sensitive-confirm-required.exception.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Typed error. In plain words: a sensitive right is widened for a role other than Administrator and `confirmSensitive` is not true (HTTP 422).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/errors/sensitive-confirm-required.exception.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { ValidationFailedException } from '@libs/common';

/**
 * SensitiveConfirmRequiredException.
 *
 * In plain words: a sensitive right is widened for a role other than Administrator and `confirmSensitive` is not true (HTTP 422).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-02, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.29 §6.6
 */
export class SensitiveConfirmRequiredException extends ValidationFailedException {
  constructor() {
    super([{ field: 'confirmSensitive', message: 'Confirm that a sensitive right is being given' }], 'Confirm the sensitive change', 'SENSITIVE_CONFIRM_REQUIRED');
  }
}
