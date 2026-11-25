/**
 * @file    company-role.dto.ts
 * @module  UsersApi
 *
 * @description
 * One company assignment in a user body. In plain words: a company, its roles and the dates.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/users/company-role.dto.ts
 * @lld-synced     v0.19
 * @status         built
 */

import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

/**
 * Company and roles of a user.
 *
 * In plain words: the company, at least one role, the first day and an optional last day.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 *   contracts: API-USR-02, API-USR-04
 *   lld:       LLD-EPIC-ADM-01 v0.19 section 6.1
 */
export class CompanyRoleDto {
  @IsString()
  @Length(1, 10)
  companyCode!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  roleIds!: string[];

  /** YYYY-MM-DD. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  validFrom!: string;

  /** YYYY-MM-DD; not before `validFrom`. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  validTo?: string;
}
