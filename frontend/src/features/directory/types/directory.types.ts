/**
 * @file    directory.types.ts
 * @module  DirectoryFeature
 *
 * @description
 * Directory types. In plain words: the small shapes of the read-only lists that several features use (departments, designations, companies, role options).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R18-S36
 * @status  built
 */

/** A department or a designation (API-MST-01, API-MST-02). */
export interface MasterItem {
  id: string;
  code: string;
  name: string;
  isHighest?: boolean;
}

/** A company (API-MST-03). */
export interface CompanyItem {
  code: string;
  name: string;
}

/** A role as the lists of other features need it (API-ROL-01): the id, the name and the status. */
export interface RoleOption {
  roleId: string;
  name: string;
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
}
