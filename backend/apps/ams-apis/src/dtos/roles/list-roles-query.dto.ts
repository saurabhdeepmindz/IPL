/**
 * @file    list-roles-query.dto.ts
 * @module  RolesApi
 *
 * @description
 * Query of the role list (API-ROL-01). In plain words: the three optional filters on the Role Management list.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/roles/list-roles-query.dto.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RoleStatus, RoleType } from '@libs/database';

/**
 * Filters of the role list.
 *
 * In plain words: type, status and a name search; all optional.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-01
 *   lld:       LLD-EPIC-ADM-01 v0.29 §6.4
 */
export class ListRolesQueryDto {
  /** STANDARD or CUSTOM. */
  @IsOptional()
  @IsEnum(RoleType)
  type?: RoleType;

  /** ACTIVE, DRAFT or INACTIVE. */
  @IsOptional()
  @IsEnum(RoleStatus)
  status?: RoleStatus;

  /** Part of the role name. */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  q?: string;
}
