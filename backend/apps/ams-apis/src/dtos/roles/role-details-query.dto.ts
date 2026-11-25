/**
 * @file    role-details-query.dto.ts
 * @module  RolesApi
 *
 * @description
 * Query of the role details (API-ROL-05). In plain words: an optional company to show the users of.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.16 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.16.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/roles/role-details-query.dto.ts
 * @lld-synced     v0.16
 * @status         built
 */

import { IsOptional, IsString, Length } from 'class-validator';

/**
 * Query of the role details.
 *
 * In plain words: the company filter; left out means the session company; ALL needs the right to see all companies (checked by the company guard).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-05
 *   lld:       LLD-EPIC-ADM-01 v0.16 §6.4
 */
export class RoleDetailsQueryDto {
  /** A company code, or ALL. */
  @IsOptional()
  @IsString()
  @Length(1, 10)
  companyCode?: string;
}
