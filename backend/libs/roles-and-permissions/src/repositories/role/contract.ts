/**
 * @file    contract.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Contract of the role repository. In plain words: what the roles service may ask of the roles table, without knowing about Prisma.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.8 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.8.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/role/contract.ts
 * @lld-synced     v0.8
 * @status         built
 */

import { RoleStatus, RoleType } from '@libs/database';

/** One role row with the number of users who hold it. */
export interface RoleRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  type: RoleType;
  status: RoleStatus;
  isLocked: boolean;
  updatedAt: Date;
  userCount: number;
}

/** Filters of the role list. */
export interface RoleFilter {
  type?: RoleType;
  status?: RoleStatus;
  q?: string;
}

/** A cell to write with a role. */
export interface RoleCellInput {
  permissionKey: string;
  allowed: boolean;
  scope: 'OWN' | 'DEPARTMENT' | 'COMPANY' | null;
}

/** What is saved on the role row. */
export interface RoleFields {
  name: string;
  description: string;
  status: RoleStatus;
}

/**
 * Role repository contract.
 *
 * In plain words: the roles service depends on this class, and tests replace it with a fake.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-01 to API-ROL-04
 *   lld:       LLD-EPIC-ADM-01 v0.8 §6.4
 */
export abstract class RoleRepository {
  /** Roles that match the filter, with their user counts. */
  abstract findPage(filter: RoleFilter): Promise<RoleRecord[]>;

  /** One role, or null. */
  abstract findById(roleId: string): Promise<RoleRecord | null>;

  /** One role by exact name (case-insensitive), or null. */
  abstract findByName(name: string): Promise<RoleRecord | null>;

  /** Creates the role and its cells in one transaction (decision L-13). */
  abstract createWithCells(fields: RoleFields, cells: RoleCellInput[]): Promise<RoleRecord>;

  /** Changes the role and replaces its cells in one transaction (decision L-13). */
  abstract updateWithCells(roleId: string, fields: RoleFields, cells: RoleCellInput[] | null): Promise<RoleRecord>;

  /** Sets the status. */
  abstract setStatus(roleId: string, status: RoleStatus): Promise<RoleRecord>;

  /** Distinct users who hold the role in any company (decision L-12). */
  abstract countHolders(roleId: string): Promise<number>;
}
