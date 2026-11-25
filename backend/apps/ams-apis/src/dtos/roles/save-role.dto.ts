/**
 * @file    save-role.dto.ts
 * @module  RolesApi
 *
 * @description
 * Body of create and change role (API-ROL-02, API-ROL-03). In plain words: the name, description, status, optional permissions and the reason for the audit trail.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/roles/save-role.dto.ts
 * @lld-synced     v0.19
 * @status         built
 */

import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsIn, IsOptional, IsString, IsUUID, Length, MaxLength, ValidateNested } from 'class-validator';
import { DataScope } from '@libs/database';

/**
 * One permission cell in a role save.
 *
 * In plain words: a permission key, allowed or not, and its data scope.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-02, API-ROL-03
 *   lld:       LLD-EPIC-ADM-01 v0.19 §6.4
 */
export class PermissionCellDto {
  /** Permission key, for example `users.view`. */
  @IsString()
  @MaxLength(60)
  permissionKey!: string;

  /** Allowed or not. */
  @IsBoolean()
  allowed!: boolean;

  /** OWN, DEPARTMENT or COMPANY; left out when the right is not scoped. */
  @IsOptional()
  @IsEnum(DataScope)
  scope?: DataScope;
}

/**
 * Body of create and change role.
 *
 * In plain words: name (up to 40), description, status ACTIVE or DRAFT, optional copy source, optional cells, and a required reason.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-02, API-ROL-03
 *   lld:       LLD-EPIC-ADM-01 v0.19 §6.4
 */
export class SaveRoleDto {
  /** Unique name, up to 40 characters. */
  @IsString()
  @Length(1, 40)
  name!: string;

  /** What the role is for. */
  @IsString()
  @Length(1, 500)
  description!: string;

  /** ACTIVE or DRAFT. */
  @IsIn(['ACTIVE', 'DRAFT'])
  status!: 'ACTIVE' | 'DRAFT';

  /** Copy the cells of this role (create only). */
  @IsOptional()
  @IsUUID()
  copyFromRoleId?: string;

  /** Cells to set; they are applied after any copy. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => PermissionCellDto)
  permissions?: PermissionCellDto[];

  /** Why the change is made; saved in the audit trail. */
  @IsString()
  @Length(1, 500)
  reason!: string;
}
