/**
 * @file    create-user.dto.ts
 * @module  UsersApi
 *
 * @description
 * Body of create user (API-USR-02). In plain words: the fields of a user; the rules that need other data (unique code, masters, manager) are checked by the service, which returns every problem together.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/users/create-user.dto.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEmail, IsIn, IsOptional, IsString, IsUUID, Length, Matches, MaxLength, ValidateNested } from 'class-validator';
import { CompanyRoleDto } from './company-role.dto';

/**
 * Body of create user.
 *
 * In plain words: all mandatory fields of API-USR-02.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 *   contracts: API-USR-02
 *   lld:       LLD-EPIC-ADM-01 v0.29 section 6.1
 */
export class CreateUserDto {
  @Matches(/^\d{5}$/)
  employeeCode!: string;

  @IsString()
  @Length(1, 100)
  fullName!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobile?: string;

  @IsUUID()
  departmentId!: string;

  @IsUUID()
  designationId!: string;

  /** A 5-digit code, or null for the highest designation. */
  @IsOptional()
  @Matches(/^\d{5}$/)
  reportingManagerCode?: string | null;

  @IsIn(['SSO', 'LOCAL'])
  signIn!: 'SSO' | 'LOCAL';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CompanyRoleDto)
  companies!: CompanyRoleDto[];
}
