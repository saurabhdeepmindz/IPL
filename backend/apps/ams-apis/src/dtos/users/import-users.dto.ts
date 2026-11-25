/**
 * @file    import-users.dto.ts
 * @module  UsersApi
 *
 * @description
 * The body of the two import routes. In plain words: a list of 1 to 200 rows; each row has the same fields as one user with exactly one company. The rules of each field are checked by the service row by row, so one bad value is reported on its row and does not refuse the whole list.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/users/import-users.dto.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CompanyRoleDto } from './company-role.dto';

/** One import row. */
export class ImportRowDto {
  @IsString() employeeCode!: string;
  @IsString() fullName!: string;
  @IsString() email!: string;
  @IsOptional() @IsString() mobile?: string | null;
  @IsString() departmentId!: string;
  @IsString() designationId!: string;
  @IsOptional() @IsString() reportingManagerCode?: string | null;
  @IsIn(['SSO', 'LOCAL']) signIn!: 'SSO' | 'LOCAL';
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CompanyRoleDto) companies!: CompanyRoleDto[];
}

/** The body: 1 to 200 rows (more gives 422). */
export class ImportUsersDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(200) @ValidateNested({ each: true }) @Type(() => ImportRowDto) rows!: ImportRowDto[];
}
