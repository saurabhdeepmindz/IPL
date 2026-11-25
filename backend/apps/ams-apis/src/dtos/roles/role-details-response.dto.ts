/**
 * @file    role-details-response.dto.ts
 * @module  RolesApi
 *
 * @description
 * Answer shapes of the role details and of the assignment. In plain words: the role with the people who hold it and what it allows.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/roles/role-details-response.dto.ts
 * @lld-synced     v0.24
 * @status         built
 */

import { DataScope } from '@libs/database';
import { RoleResponseDto } from './role-response.dto';

/**
 * Role details answers.
 *
 * In plain words: plain shapes with no logic.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-05, API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.24 §6.4
 */
export class RoleHolderDto {
  employeeCode!: string;
  name!: string;
  department!: string | null;
  company!: string;
  /** ISO 8601, UTC. */
  assignedOn!: string;
}

export class RoleAllowDto {
  permission!: string;
  scope!: DataScope | null;
}

export class RoleDetailsDto extends RoleResponseDto {
  users!: RoleHolderDto[];
  allows!: RoleAllowDto[];
}

export class AssignResultDto {
  assigned!: number;
}
