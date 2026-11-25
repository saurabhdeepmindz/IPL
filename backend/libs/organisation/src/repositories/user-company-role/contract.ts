/**
 * @file    contract.ts
 * @module  OrganisationModule
 *
 * @description
 * Contract of the user-company-role repository. In plain words: the roles users hold in a company. EXTENDS the built file: `listByUser` exists (US-ADM01-017); this story adds `listByRole`, `findHolders` and `insertMany` (decision L-38).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.18 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.18.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/organisation/src/repositories/user-company-role/contract.ts
 * @lld-synced     v0.18
 * @status         built
 */

import { Prisma, RoleStatus } from '@libs/database';

/** A database transaction a caller may pass so the roles are written in the caller's transaction. */
export type DbTransaction = Prisma.TransactionClient;

/** One role a user holds in a company, with the dates it counts. */
export interface UserRoleGrant {
  roleId: string;
  roleCode: string;
  roleStatus: RoleStatus;
  validFrom: Date;
  validTo: Date | null;
}

/**
 * Read access to the roles given to users.
 *
 * In plain words: asks "which roles does this person hold in this company on this day?". The write methods come with their own stories.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
/** One person who holds a role, as the role details show them. */
export interface RoleHolderRow {
  employeeCode: string;
  fullName: string;
  departmentName: string | null;
  companyCode: string;
  assignedOn: Date;
}

/** One assignment to write. */
export interface NewAssignment {
  userId: string;
  roleId: string;
  companyCode: string;
  validFrom: Date;
  validTo?: Date | null;
  assignedBy: string;
}

export abstract class UserCompanyRoleRepository {
  /**
   * The roles a user holds in a company that are valid on a date.
   *
   * In plain words: a role whose end date has passed, or whose start date is not yet reached, is not returned; neither is a role of another company.
   *
   * @param userId Internal key of the user
   * @param companyCode Company, for example IPL
   * @param validOn The day to check
   * @returns The grants valid on that day (the role status is returned; the caller keeps only ACTIVE roles)
   * @dependencies none
   */
  abstract listByUser(userId: string, companyCode: string, validOn: Date): Promise<UserRoleGrant[]>;

  /** The people who hold the role today; `companyCode` null means every company (decision L-33). */
  abstract listByRole(roleId: string, companyCode: string | null, validOn: Date): Promise<RoleHolderRow[]>;

  /** Which of these users already hold the role in the company on the given day (decision L-34). */
  abstract findHolders(roleId: string, companyCode: string, userIds: string[], onDate: Date): Promise<string[]>;

  /** Writes the assignments in one transaction. Returns how many were written. */
  abstract insertMany(rows: NewAssignment[]): Promise<number>;

  /**
   * Replaces the company roles of a user with the given ones (US-ADM01-003).
   *
   * In plain words: a role that stays is kept; a role that goes is ended yesterday (or dropped when it never started); a new role is added. Pass `tx` to write inside the caller's transaction.
   */
  abstract replaceForUser(userId: string, rows: NewAssignment[], tx?: DbTransaction): Promise<void>;
}
