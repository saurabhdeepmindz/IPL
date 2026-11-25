/**
 * @file    list-users-query.dto.ts
 * @module  UsersApi
 *
 * @description
 * Query of the user list (API-USR-01). In plain words: tab, search text, filters, paging and order; every one optional.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-001
 * @subtask        ST-ADM01-001-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/users/list-users-query.dto.ts
 * @lld-synced     v0.21
 * @status         built
 */

import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';

/**
 * Filters of the user list.
 *
 * In plain words: all optional; an invalid one is refused with 422 naming the parameter.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-001
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4, FR-042.6, FR-043.2
 *   contracts: API-USR-01
 *   lld:       LLD-EPIC-ADM-01 v0.21 section 6.1
 */
export class ListUsersQueryDto {
  @IsOptional()
  @IsIn(['all', 'active', 'inactive', 'locked'])
  status?: 'all' | 'active' | 'inactive' | 'locked';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  /** A company code, or ALL (the company guard decides). */
  @IsOptional()
  @IsString()
  @MaxLength(10)
  companyCode?: string;

  @IsOptional()
  @IsIn(['SSO', 'LOCAL'])
  signIn?: 'SSO' | 'LOCAL';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  /** Field and direction, for example `name:asc`. */
  @IsOptional()
  @Matches(/^(name|employeeCode|status|department):(asc|desc)$/)
  sort?: string;
}
