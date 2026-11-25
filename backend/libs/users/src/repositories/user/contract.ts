/**
 * @file    contract.ts
 * @module  UsersModule
 *
 * @description
 * Contract of the user repository. EXTENDS the minimal file built for US-ADM01-011 (`findByCodes`) with the methods of the users stories (decision L-41).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011, US-ADM01-001, US-ADM01-003, US-ADM01-005
 * @subtask        ST-ADM01-001-BE-03, ST-ADM01-003-BE-04, ST-ADM01-005-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user/contract.ts
 * @lld-synced     v0.19
 * @status         built
 */

import { AuthType, UserStatus } from '@libs/database';

/** The filters of the user list. `companyCode` null means every company (decision L-42). */
export interface UserFilter {
  companyCode: string | null;
  status?: UserStatus;
  q?: string;
  departmentId?: string;
  roleId?: string;
  signIn?: AuthType;
}

/** Paging and order of the user list. */
export interface UserPaging {
  page: number;
  pageSize: number;
  sort: string;
}

/** One company with the role names the user holds in it. */
export interface UserCompanyRoles {
  code: string;
  roles: string[];
}

/** A user as the list and the details show one. */
export interface UserRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  mobile: string | null;
  departmentId: string | null;
  departmentName: string | null;
  designationId: string | null;
  designationName: string | null;
  reportingManagerId: string | null;
  authType: AuthType;
  status: UserStatus;
  firstSignInAt: Date | null;
  lastSignInAt: Date | null;
  mustChangePassword: boolean;
  companies: UserCompanyRoles[];
}

/** What a new user is made of (the company roles are written in the same transaction). */
export interface NewUser {
  employeeCode: string;
  fullName: string;
  email: string;
  mobile: string | null;
  departmentId: string;
  designationId: string;
  reportingManagerId: string | null;
  authType: AuthType;
}

/** One company assignment of a user. */
export interface UserAssignment {
  companyCode: string;
  roleId: string;
  validFrom: Date;
  validTo: Date | null;
  assignedBy: string;
}

/** A user as the roles code needs to see one. */
export interface UserRef {
  id: string;
  employeeCode: string;
  fullName: string;
  status: UserStatus;
  departmentName: string | null;
}

/**
 * User repository contract.
 *
 * In plain words: the roles service depends on this class, and tests replace it with a fake.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-05, API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.19 §6.4
 */
export abstract class UserRepository {
  /** The users with these employee codes; a code that matches nobody is simply not in the answer. */
  abstract findByCodes(codes: string[]): Promise<UserRef[]>;

  /** One page of the user list and the total (decision L-42, L-43). */
  abstract findPage(filter: UserFilter, paging: UserPaging): Promise<{ rows: UserRecord[]; total: number }>;

  /** How many users have each status for these filters, ignoring the status tab (decision L-44). */
  abstract countByStatus(filter: UserFilter): Promise<Record<UserStatus, number>>;

  /** One user by employee code, or null. */
  abstract findByCode(employeeCode: string): Promise<UserRecord | null>;

  /** One user by e-mail (any letter case), or null. */
  abstract findByEmail(email: string): Promise<UserRecord | null>;

  /** How many Active users hold the Administrator role today in any company (decision L-54). */
  abstract adminCount(): Promise<number>;

  /** True when the user holds the Administrator role today (any company). */
  abstract isAdministrator(userId: string): Promise<boolean>;
}
