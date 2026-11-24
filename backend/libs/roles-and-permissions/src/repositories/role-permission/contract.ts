/**
 * @file    contract.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Contract of the role-permission repository. In plain words: what the rest of the code may ask about the cells of the permission matrix.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-08
 */

import { DataScope } from '@libs/database';

/** One cell of the permission matrix as the guards need it. */
export interface PermissionCell {
  key: string;
  allowed: boolean;
  scope: DataScope | null;
}

/**
 * Read access to the cells of a role.
 *
 * In plain words: asks "what may this role do, and how far?". The write methods come with the matrix stories.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export abstract class RolePermissionRepository {
  /**
   * The cells of a role.
   *
   * In plain words: every right the role has a row for, with the permission key, the allowed flag and the data scope.
   *
   * @param roleId Internal key of the role
   * @returns The cells of the role
   * @dependencies none
   */
  abstract listForRole(roleId: string): Promise<PermissionCell[]>;
}
