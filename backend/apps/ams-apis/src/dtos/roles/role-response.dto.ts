/**
 * @file    role-response.dto.ts
 * @module  RolesApi
 *
 * @description
 * Answer shape of the role routes. In plain words: one role as the Role Management screen shows it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/roles/role-response.dto.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { RoleStatus, RoleType } from '@libs/database';
import type { RoleRecord } from '@libs/roles-and-permissions';

/**
 * One role in an answer.
 *
 * In plain words: id, name, description, type, how many users hold it, when it last changed, and its status.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-01, API-ROL-02, API-ROL-03
 *   lld:       LLD-EPIC-ADM-01 v0.29 §6.4
 */
export class RoleResponseDto {
  roleId!: string;
  name!: string;
  description!: string;
  type!: RoleType;
  /** Distinct users who hold the role in any company. */
  userCount!: number;
  /** ISO 8601, UTC. */
  lastChanged!: string;
  status!: RoleStatus;
}

/** One role as the screen shows it (the same mapping for every role route). */
export const toRoleResponse = (r: RoleRecord): RoleResponseDto => ({
  roleId: r.id,
  name: r.name,
  description: r.description,
  type: r.type,
  userCount: r.userCount,
  lastChanged: r.updatedAt.toISOString(),
  status: r.status,
});
