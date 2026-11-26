/**
 * @file    user.types.ts
 * @module  UsersFeature
 *
 * @description
 * Types of the users screens. In plain words: the shapes the user and masters calls send and return (field names as in the contracts API-USR-01 to 04 and API-MST-01 to 03).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002, US-ADM01-004
 * @subtask        ST-ADM01-002-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/types/user.types.ts
 * @lld-synced     v0.30
 * @status         built
 */
/** One company with the roles the user holds in it. */
export interface UserCompany {
  code: string;
  roles: string[];
}

/** One user as the list shows it (API-USR-01). */
export interface UserListItem {
  employeeCode: string;
  name: string;
  email: string;
  department: string | null;
  designation: string | null;
  companies: UserCompany[];
  signIn: 'SSO' | 'LOCAL';
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  lastSignIn: string | null;
}

/** The answer of the list call (API-USR-01). */
export interface UserList {
  items: UserListItem[];
  counts: { all: number; active: number; inactive: number; locked: number };
  page: number;
  pageSize: number;
  total: number;
}

/** The filters of the list call. */
export interface UserFilters {
  status?: 'all' | 'active' | 'inactive' | 'locked';
  q?: string;
  departmentId?: string;
  roleId?: string;
  signIn?: 'SSO' | 'LOCAL';
  companyCode?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

/** One user with the details screen's extra fields (API-USR-03). */
export interface UserDetails extends UserListItem {
  firstSignInAt: string | null;
  signInLocked: boolean;
  summaryText: string;
  activity: { at: string; text: string }[];
  /** The data the Edit form needs (decision L-78). */
  form: UserEditData | null;
}

/** The `form` part of API-USR-03. */
export interface UserEditData {
  mobile: string | null;
  departmentId: string | null;
  designationId: string | null;
  reportingManagerCode: string | null;
  companies: { companyCode: string; roleIds: string[]; validFrom: string; validTo: string | null }[];
}

/** One company assignment of the form. */
export interface CompanyRoleInput {
  companyCode: string;
  roleIds: string[];
  validFrom: string;
  validTo?: string;
}

/** What the create and change calls send (API-USR-02, API-USR-04). */
export interface UserFormData {
  employeeCode: string;
  newEmployeeCode?: string;
  fullName: string;
  email: string;
  mobile?: string;
  departmentId: string;
  designationId: string;
  reportingManagerCode?: string | null;
  signIn: 'SSO' | 'LOCAL';
  companies: CompanyRoleInput[];
}

/** The answer of a create (API-USR-02). */
export interface CreateUserResult {
  employeeCode: string;
  status: 'ACTIVE';
  oneTimePassword: { required: boolean; emailStatus: 'SENT' | 'FAILED' | null };
}

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

/** The reasons API-USR-05 accepts. */
export type DeactivationReason = 'LEFT_COMPANY' | 'TRANSFERRED' | 'LONG_LEAVE' | 'DUPLICATE' | 'OTHER';

/** The body of the deactivate call (API-USR-05). */
export interface DeactivateInput {
  reason: DeactivationReason;
  note?: string;
  /** Set true after the proposals warning has been shown. */
  confirmWithProposals?: boolean;
}

/** The warning of a 409 HOLDS_PROPOSALS (API-USR-05). */
export interface HoldsProposals {
  count: number;
  workflowMonitorUrl: string;
  hasDelegate: boolean;
}

/** The actions of story 008 (API-USR-06, 07, 08). */
export type UserActionKind = 'unlock' | 'reset-password' | 'resend-otp';

/** The e-mail status of a password action. */
export type EmailStatus = 'SENT' | 'FAILED';
