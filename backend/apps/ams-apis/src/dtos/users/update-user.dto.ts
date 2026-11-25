/**
 * @file    update-user.dto.ts
 * @module  UsersApi
 *
 * @description
 * Body of change user (API-USR-04). In plain words: the whole record, and optionally a corrected employee code (only before the first sign-in).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/users/update-user.dto.ts
 * @lld-synced     v0.23
 * @status         built
 */

import { IsOptional, Matches } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

/**
 * Body of change user.
 *
 * In plain words: the same fields as create plus `newEmployeeCode`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 *   contracts: API-USR-04
 *   lld:       LLD-EPIC-ADM-01 v0.23 section 6.1
 */
export class UpdateUserDto extends CreateUserDto {
  /** Accepted only while the user has not signed in (decision OP-01). */
  @IsOptional()
  @Matches(/^\d{5}$/)
  newEmployeeCode?: string;
}
