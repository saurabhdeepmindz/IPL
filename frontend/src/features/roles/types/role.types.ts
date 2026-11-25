/**
 * @file    role.types.ts
 * @module  RolesFeature
 *
 * @description
 * Types of the roles screens. In plain words: the shapes the role calls send and return (the same field names as the contracts API-ROL-01 to 06).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012, US-ADM01-013
 * @subtask        ST-ADM01-012-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/types/role.types.ts
 * @lld-synced     v0.26
 * @status         built
 */
/** One role as the list shows it (API-ROL-01). */
export interface Role {
  roleId: string;
  name: string;
  description: string;
  type: 'STANDARD' | 'CUSTOM';
  userCount: number;
  lastChanged: string;
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
}

/** Data scope of a permission cell (the back end knows these three). */
export type DataScope = 'OWN' | 'DEPARTMENT' | 'COMPANY';

/** One permission cell of a role, as the save call sends it. */
export interface PermissionCell {
  permissionKey: string;
  allowed: boolean;
  scope?: DataScope;
}

/** What the save role call sends (API-ROL-02, API-ROL-03). */
export interface SaveRoleInput {
  name: string;
  description: string;
  status: 'ACTIVE' | 'DRAFT';
  copyFromRoleId?: string;
  permissions?: PermissionCell[];
  reason: string;
}

/** One permission of the catalog (from the matrix read, API-PRM-01). */
export interface CatalogPermission {
  key: string;
  label: string;
  hint: string;
  /** True when a cell of the matrix carries a data scope for this permission. */
  scoped: boolean;
}

/** A module of the catalog with its permissions. */
export interface CatalogModule {
  name: string;
  permissions: CatalogPermission[];
}

/** One cell of a role in the matrix. */
export interface CatalogCell {
  allowed: boolean;
  scope: DataScope | null;
  locked: boolean;
}

/** The permissions by module and the cells of every role (API-PRM-01). */
export interface PermissionCatalog {
  modules: CatalogModule[];
  cellsByRole: Record<string, Record<string, CatalogCell>>;
}

/** One person who holds a role (API-ROL-05). */
export interface RoleHolder {
  employeeCode: string;
  name: string;
  department: string | null;
  company: string;
  assignedOn: string;
}

/** A role with its holders and what it allows (API-ROL-05). */
export interface RoleDetails extends Role {
  users: RoleHolder[];
  allows: { permission: string; scope: DataScope | null }[];
}
