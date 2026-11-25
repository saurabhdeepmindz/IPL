/**
 * @file    save-changes.dto.ts
 * @module  RolesApi
 *
 * @description
 * Body of the save (API-PRM-03). In plain words: the changes, the version the screen saw, the reason, an optional approval reference and the confirmation of sensitive rights.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/permissions/save-changes.dto.ts
 * @lld-synced     v0.21
 * @status         built
 */

import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsOptional, IsString, Length, Matches, MaxLength, ValidateNested } from 'class-validator';
import { CellChangeDto } from './review-changes.dto';

/**
 * Body of the save.
 *
 * In plain words: everything the server needs to check and record the save.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.21 §6.6
 */
export class SaveChangesDto {
  /** The changes to save. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => CellChangeDto)
  changes!: CellChangeDto[];

  /** The version from API-PRM-01, a whole number as text. */
  @IsString()
  @Matches(/^\d+$/)
  matrixVersion!: string;

  /** Why the change is made; saved in the audit trail. */
  @IsString()
  @Length(1, 500)
  reason!: string;

  /** Reference of the approval, if there is one. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  approvalReference?: string;

  /** Must be true when a sensitive right goes to a role other than Administrator. */
  @IsOptional()
  @IsBoolean()
  confirmSensitive?: boolean;
}
