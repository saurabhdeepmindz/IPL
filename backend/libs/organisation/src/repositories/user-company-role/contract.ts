/**
 * @file    contract.ts
 * @module  OrganisationModule
 *
 * @description
 * Contract of the user-company-role repository. In plain words: what the rest of the code may ask about the roles a user holds; the database file is the only one that knows how.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-08
 */

import { RoleStatus } from '@libs/database';

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
}
