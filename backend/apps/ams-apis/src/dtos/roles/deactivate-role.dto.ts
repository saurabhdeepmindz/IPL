/**
 * @file    deactivate-role.dto.ts
 * @module  RolesApi
 *
 * @description
 * Body of deactivate role (API-ROL-04). In plain words: only the reason.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/roles/deactivate-role.dto.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { IsString, Length } from 'class-validator';

/**
 * Body of deactivate role.
 *
 * In plain words: the reason that is saved in the audit trail.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-04
 *   lld:       LLD-EPIC-ADM-01 v0.29 §6.4
 */
export class DeactivateRoleDto {
  /** Why the role is deactivated. */
  @IsString()
  @Length(1, 500)
  reason!: string;
}
