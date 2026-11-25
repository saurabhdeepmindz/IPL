/**
 * @file    data-scope.filter.ts
 * @module  AuthorizationModule
 *
 * @description
 * Turns a data scope into a database filter. In plain words: a user with the OWN scope sees only their own records, DEPARTMENT only their department's, COMPANY all of the company's.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.5 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.5.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/data-scope.filter.ts
 * @lld-synced     v0.5
 * @status         pseudo
 */

import { Injectable } from '@nestjs/common';
import { DataScope } from '@libs/database';
import { SessionUser } from './session-user.interface';

/** Names of the columns the filter uses on the table being read. */
export interface ScopeFields {
  /** Column that holds the owner (for OWN), for example `createdBy`. */
  ownerField: string;
  /** Column that holds the department (for DEPARTMENT), for example `departmentId`. */
  departmentField: string;
  /** Column that holds the company; defaults to `companyCode`. */
  companyField?: string;
}

/**
 * Builds the where-fragment for a data scope.
 *
 * In plain words: limits a list to the records the user's role lets them see.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none (list calls)
 *   lld:       LLD-EPIC-ADM-01 v0.5 §6.8
 */
@Injectable()
export class DataScopeFilter {
  /**
   * Returns the filter to add to a list query.
   *
   * In plain words: says "only this user's records", "only this department's", or "all of the company's".
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-04
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.5 §6.8
 * @status    pseudo
   *
   * @dependencies none
   *
   * @param scope - From `request.dataScope`; null means the permission is not scoped
   * @param user - The signed-in user
   * @param fields - The column names of the table being read
   * @returns A where-fragment such as `{ companyCode: 'IPL', createdBy: 'u-1' }`
   */
  toWhere(scope: DataScope | null, user: SessionUser, fields: ScopeFields): Record<string, unknown> {
    // TODO: 1. Always start with { [companyField ?? 'companyCode']: user.companyCode }.
    // TODO: 2. OWN: add { [ownerField]: user.userId }.
    // TODO: 3. DEPARTMENT: add { [departmentField]: user.departmentId }; if the user has no department, match nothing.
    // TODO: 4. COMPANY or null: add nothing more.
    throw new Error('pseudo-code: not implemented');
  }
}
