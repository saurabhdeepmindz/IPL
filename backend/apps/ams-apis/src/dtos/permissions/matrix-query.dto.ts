/**
 * @file    matrix-query.dto.ts
 * @module  RolesApi
 *
 * @description
 * Query of the matrix read (API-PRM-01). In plain words: an optional module and an optional text.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/permissions/matrix-query.dto.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Filters of the matrix read.
 *
 * In plain words: filter by SOW module and find a permission by text; both optional.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-01
 *   lld:       LLD-EPIC-ADM-01 v0.29 §6.6
 */
export class MatrixQueryDto {
  /** SOW module (the permission area). */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  module?: string;

  /** Text to find in the permission label or key. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  q?: string;
}
