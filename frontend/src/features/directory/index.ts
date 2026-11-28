/**
 * @file    index.ts
 * @module  DirectoryFeature
 *
 * @description
 * Public exports of the directory feature. In plain words: the read-only lists (roles, departments, designations, companies) that several features use; the only file other features import from.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R18-S36
 * @status  built
 */
export { useRoleOptions } from './hooks/useRoleOptions';
export { useCompanies, useDepartments, useDesignations } from './hooks/useMasters';
export { getCompanies } from './services/masters.service';
export type { CompanyItem, MasterItem, RoleOption } from './types/directory.types';
