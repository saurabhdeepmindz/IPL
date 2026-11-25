/**
 * @file    deactivate-user.dto.ts
 * @module  UsersApi
 *
 * @description
 * Body of deactivate user (API-USR-05). In plain words: a reason from the five, an optional note, and the confirmation after the proposals warning.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/users/deactivate-user.dto.ts
 * @lld-synced     v0.28
 * @status         built
 */

import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Body of deactivate user.
 *
 * In plain words: reason, note and confirmWithProposals.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-05
 *   lld:       LLD-EPIC-ADM-01 v0.28 section 6.1
 */
export class DeactivateUserDto {
  @IsIn(['LEFT_COMPANY', 'TRANSFERRED', 'LONG_LEAVE', 'DUPLICATE', 'OTHER'])
  reason!: 'LEFT_COMPANY' | 'TRANSFERRED' | 'LONG_LEAVE' | 'DUPLICATE' | 'OTHER';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  /** Set true after the warning has been shown. */
  @IsOptional()
  @IsBoolean()
  confirmWithProposals?: boolean;
}
