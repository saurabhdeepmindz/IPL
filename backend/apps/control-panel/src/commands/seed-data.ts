/**
 * @file    seed-data.ts
 * @module  ControlPanel
 *
 * @description
 * The fixed data the seed commands write. In plain words: the six standard roles, the permission keys and what each role may do (Suggested by Deepmindz, IPL to confirm).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-07
 */

import { PROTECTED_RIGHTS } from '@libs/roles-and-permissions';
import { DataScope } from '@libs/database';

export interface RoleSeed {
  code: string;
  name: string;
  description: string;
  landingOrder: number;
  isLocked: boolean;
}

/** The six standard roles (SOW). */
export const STANDARD_ROLES: RoleSeed[] = [
  { code: 'ADMINISTRATOR', name: 'Administrator', description: 'Manages users, roles and the permission matrix', landingOrder: 1, isLocked: true },
  { code: 'INITIATOR', name: 'Initiator', description: 'Starts proposals and sends them for approval', landingOrder: 2, isLocked: false },
  { code: 'PROCESSOR', name: 'Processor', description: 'Processes proposals through the approval steps', landingOrder: 3, isLocked: false },
  { code: 'FINANCE', name: 'Finance', description: 'Reviews and approves the financial side of proposals', landingOrder: 4, isLocked: false },
  { code: 'REPORT_VIEWER', name: 'Report Viewer', description: 'Reads reports; no change rights', landingOrder: 5, isLocked: false },
  { code: 'AUDITOR', name: 'Auditor', description: 'Reads everything and the audit log; no change rights', landingOrder: 6, isLocked: false },
];

export interface PermissionSeed {
  code: string;
  area: string;
  description: string;
}

/** The permission keys EPIC-ADM-01 needs; other epics add theirs. */
export const PERMISSIONS: PermissionSeed[] = [
  { code: 'users.view', area: 'users', description: 'See the list and details of users' },
  { code: 'users.manage', area: 'users', description: 'Create, change, deactivate users and give them roles' },
  { code: 'roles.view', area: 'roles', description: 'See roles and the permission matrix' },
  { code: 'roles.manage', area: 'roles', description: 'Create and change roles and the permission matrix' },
  { code: 'companies.view-all', area: 'companies', description: 'See data of every company (companyCode=ALL)' },
  { code: 'audit.view', area: 'audit', description: 'See the audit log and the security log' },
];

/** Rights held by each role. Every other cell is written as not allowed. */
export const GRANTS: Record<string, Record<string, DataScope | null>> = {
  ADMINISTRATOR: {
    'users.view': 'COMPANY', 'users.manage': 'COMPANY', 'roles.view': null, 'roles.manage': null,
    'companies.view-all': null, 'audit.view': 'COMPANY',
  },
  AUDITOR: { 'users.view': 'COMPANY', 'roles.view': null, 'companies.view-all': null, 'audit.view': 'COMPANY' },
};

/** Rights the Administrator role can never lose: one list, held in the roles library (decision L-15). */
export const PROTECTED_KEYS = PROTECTED_RIGHTS;

export const COMPANIES = [
  { code: 'IPL', name: 'Indian Potash Limited' },
  { code: 'IPLFB', name: 'IPL (second company - name to be confirmed by IPL)' },
];
export const DEPARTMENTS = [
  { code: 'FIN', name: 'Finance' },
  { code: 'PUR', name: 'Purchase' },
  { code: 'OPS', name: 'Operations' },
  { code: 'IT', name: 'Information Technology' },
];
export const DESIGNATIONS = [
  { code: 'EXEC', name: 'Executive' },
  { code: 'MGR', name: 'Manager' },
  { code: 'AGM', name: 'Assistant General Manager' },
];
