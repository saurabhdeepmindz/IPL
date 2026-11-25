/**
 * @file    data-scope.filter.spec.ts
 * @module  AuthorizationModule
 *
 * @description
 * Unit tests of the data-scope filter (Jest). Written before the code (TDD).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.8 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.8.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/data-scope.filter.spec.ts
 * @lld-synced     v0.8
 * @status         built
 */

import { DataScope } from '@libs/database';
import { DataScopeFilter, ScopeFields } from './data-scope.filter';
import { SessionUser } from './session-user.interface';

const user: SessionUser = { userId: 'u-1', employeeCode: '10002', companyCode: 'IPL', departmentId: 'd-1' };
const fields: ScopeFields = { ownerField: 'createdBy', departmentField: 'departmentId' };

describe('DataScopeFilter.toWhere', () => {
  const filter = new DataScopeFilter();

  /**
   * @tc TC-ADM01-017-J08
   * @story US-ADM01-017
   * @ac AC-US017-08
   * @subtask ST-ADM01-017-BE-04
   * In plain words: OWN shows only the user's own records inside the company.
   */
  it('limits OWN to the owner within the company', () => {
    expect(filter.toWhere(DataScope.OWN, user, fields)).toEqual({ companyCode: 'IPL', createdBy: 'u-1' });
  });

  /**
   * @tc TC-ADM01-017-J08
   * @story US-ADM01-017
   * @ac AC-US017-08
   * @subtask ST-ADM01-017-BE-04
   * In plain words: DEPARTMENT shows the user's department.
   */
  it('limits DEPARTMENT to the department of the user', () => {
    expect(filter.toWhere(DataScope.DEPARTMENT, user, fields)).toEqual({ companyCode: 'IPL', departmentId: 'd-1' });
  });

  /**
   * @tc TC-ADM01-017-J08
   * @story US-ADM01-017
   * @ac AC-US017-08
   * @subtask ST-ADM01-017-BE-04
   * In plain words: a user with no department sees no department records at all.
   */
  it('matches nothing for DEPARTMENT when the user has no department', () => {
    const where = filter.toWhere(DataScope.DEPARTMENT, { ...user, departmentId: null }, fields);
    expect(where).toEqual({ companyCode: 'IPL', departmentId: { in: [] } });
  });

  /**
   * @tc TC-ADM01-017-J08
   * @story US-ADM01-017
   * @ac AC-US017-08
   * @subtask ST-ADM01-017-BE-04
   * In plain words: COMPANY shows the whole company.
   */
  it('adds only the company for COMPANY', () => {
    expect(filter.toWhere(DataScope.COMPANY, user, fields)).toEqual({ companyCode: 'IPL' });
  });

  /**
   * @tc TC-ADM01-017-J08
   * @story US-ADM01-017
   * @ac AC-US017-08
   * @subtask ST-ADM01-017-BE-04
   * In plain words: an unscoped permission adds only the company, and the company column name can be changed.
   */
  it('adds only the company when there is no scope, and honours a custom company column', () => {
    expect(filter.toWhere(null, user, fields)).toEqual({ companyCode: 'IPL' });
    expect(filter.toWhere(null, user, { ...fields, companyField: 'company' })).toEqual({ company: 'IPL' });
  });
});
