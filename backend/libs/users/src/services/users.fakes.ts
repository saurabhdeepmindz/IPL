/**
 * @file    users.fakes.ts
 * @module  UsersModule
 *
 * @description
 * Test helpers of the users service specs. In plain words: a user record with sensible defaults and an in-memory fake of the read side of the user repository that remembers its calls.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-001
 * @subtask        ST-ADM01-001-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/users.fakes.ts
 * @lld-synced     v0.23
 * @status         built
 */

import { UserStatus } from '@libs/database';
import { UserFilter, UserPaging, UserRecord } from '../repositories/user';

/** One user record with sensible defaults. */
export const userRecord = (over: Partial<UserRecord> = {}): UserRecord => ({
  id: `id-${over.employeeCode ?? '10001'}`,
  employeeCode: '10001',
  fullName: 'Test User',
  email: 'test.user@example.invalid',
  mobile: null,
  departmentId: null,
  departmentName: null,
  designationId: null,
  designationName: null,
  reportingManagerId: null,
  authType: 'SSO',
  status: 'ACTIVE',
  firstSignInAt: null,
  lastSignInAt: null,
  mustChangePassword: false,
  companies: [{ code: 'IPL', roles: ['Initiator'] }],
  ...over,
});

/** The read side of the user repository, in memory. */
export class FakeUserReads {
  rows: UserRecord[] = [];
  counts: Record<UserStatus, number> = { ACTIVE: 0, INACTIVE: 0, LOCKED: 0 };
  pageCalls: Array<{ filter: UserFilter; paging: UserPaging }> = [];
  countCalls: UserFilter[] = [];

  async findPage(filter: UserFilter, paging: UserPaging): Promise<{ rows: UserRecord[]; total: number }> {
    this.pageCalls.push({ filter, paging });
    return { rows: this.rows, total: this.rows.length };
  }
  async countByStatus(filter: UserFilter): Promise<Record<UserStatus, number>> {
    this.countCalls.push(filter);
    return this.counts;
  }
}
