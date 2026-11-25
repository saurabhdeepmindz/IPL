/**
 * @file    review-changes.dto.ts
 * @module  RolesApi
 *
 * @description
 * Body of the review (API-PRM-02). In plain words: the list of cell changes to preview. The change shape is also used by the save.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.14 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.14.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/permissions/review-changes.dto.ts
 * @lld-synced     v0.14
 * @status         built
 */

import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { DataScope } from '@libs/database';

/**
 * One cell change.
 *
 * In plain words: a role, a permission, and the new allowed flag and/or scope.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-02, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.14 §6.6
 */
export class CellChangeDto {
  /** The role. */
  @IsUUID()
  roleId!: string;

  /** The permission key, for example `users.view`. */
  @IsString()
  @MaxLength(60)
  permissionKey!: string;

  /** The new allowed flag; left out to keep it. */
  @IsOptional()
  @IsBoolean()
  allowed?: boolean;

  /** OWN, DEPARTMENT or COMPANY; null removes the scope; left out to keep it. */
  @IsOptional()
  @IsEnum(DataScope)
  scope?: DataScope | null;
}

/**
 * Body of the review.
 *
 * In plain words: the changes to preview, at least one and at most 200.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-02
 *   lld:       LLD-EPIC-ADM-01 v0.14 §6.6
 */
export class ReviewChangesDto {
  /** The changes to preview. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => CellChangeDto)
  changes!: CellChangeDto[];
}
