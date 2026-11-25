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
 * @lld            LLD-EPIC-ADM-01 v0.5 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.5.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/data-scope.filter.spec.ts
 * @lld-synced     v0.5
 * @status         pseudo
 */

describe('DataScopeFilter.toWhere', () => {
  /** @tc TC-ADM01-017-J08 @story US-ADM01-017 @ac AC-US017-08 @subtask ST-ADM01-017-BE-06 */
  it('limits OWN to the owner within the company', () => {
    // TODO: expect { companyCode, createdBy: userId }.
  });

  /** @tc TC-ADM01-017-J08 @story US-ADM01-017 @ac AC-US017-08 @subtask ST-ADM01-017-BE-06 */
  it('limits DEPARTMENT to the department, and matches nothing for a user with no department', () => {
    // TODO: expect the department field; and an impossible match for a null department.
  });

  /** @tc TC-ADM01-017-J08 @story US-ADM01-017 @ac AC-US017-08 @subtask ST-ADM01-017-BE-06 */
  it('adds only the company for COMPANY or an unscoped permission', () => {
    // TODO: expect { companyCode } only.
  });
});
