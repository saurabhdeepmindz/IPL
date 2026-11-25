/**
 * @file    assign-users.dto.ts
 * @module  RolesApi
 *
 * @description
 * Body of give-a-role-to-users (API-ROL-06). In plain words: the employee codes, the company, the first day and the reason.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/roles/assign-users.dto.ts
 * @lld-synced     v0.24
 * @status         built
 */

import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, Length, Matches } from 'class-validator';

/**
 * Body of assign users.
 *
 * In plain words: at least one and at most 500 employee codes; the company; the valid-from date; the reason.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.24 §6.4
 */
export class AssignUsersDto {
  /** Employee codes of the users to give the role to. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsString({ each: true })
  @Length(5, 5, { each: true })
  employeeCodes!: string[];

  /** The company the role is held in; it must be the session company (decision L-32). */
  @IsString()
  @Length(1, 10)
  companyCode!: string;

  /** First day the role is held, as YYYY-MM-DD. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  validFrom!: string;

  /** Why the role is given; saved in the audit trail. */
  @IsString()
  @Length(1, 500)
  reason!: string;
}
