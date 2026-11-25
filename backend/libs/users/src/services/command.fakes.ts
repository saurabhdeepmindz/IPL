/**
 * @file    command.fakes.ts
 * @module  UsersModule
 *
 * @description
 * Test helpers of the user command service and the input validator. In plain words: in-memory stand-ins for the masters port, the user reads and the user writes, and a valid user input to start from.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.16 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.16.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/command.fakes.ts
 * @lld-synced     v0.16
 * @status         built
 */

import { NewUser, UserAssignment, UserRecord } from '../repositories/user';
import { UserInput } from './user-input-validator';
import { userRecord } from './users.fakes';

/** A user input that passes every rule. */
export const validInput = (over: Partial<UserInput> = {}): UserInput => ({
  employeeCode: '20001',
  fullName: 'New Person',
  email: 'new.person@example.invalid',
  mobile: '9876543210',
  departmentId: 'dept-1',
  designationId: 'desig-1',
  reportingManagerCode: '10050',
  signIn: 'LOCAL',
  companies: [{ companyCode: 'IPL', roleIds: ['role-1'], validFrom: new Date('2026-12-01'), validTo: null }],
  ...over,
});

/** The masters port with one department, a normal designation and a highest one. */
export class FakeMasters {
  async departmentExists(id: string): Promise<boolean> {
    return id === 'dept-1';
  }
  async designationExists(id: string): Promise<boolean> {
    return id === 'desig-1' || id === 'desig-top';
  }
  async isHighestDesignation(id: string): Promise<boolean> {
    return id === 'desig-top';
  }
}

/** The read side of the user repository: a manager, an existing user and lookups by code and e-mail. */
export class FakeCommandReads {
  users: UserRecord[] = [
    userRecord({ employeeCode: '10050', id: 'u-manager', email: 'manager@example.invalid' }),
    userRecord({ employeeCode: '10051', id: 'u-off', status: 'INACTIVE', email: 'off@example.invalid' }),
    userRecord({ employeeCode: '30001', id: 'u-existing', email: 'existing@example.invalid', authType: 'LOCAL' }),
    userRecord({ employeeCode: '30002', id: 'u-signed', email: 'signed@example.invalid', authType: 'LOCAL', firstSignInAt: new Date('2026-05-01') }),
  ];
  async findByCode(code: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.employeeCode === code) ?? null;
  }
  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }
}

/** The write side of the user repository: remembers what it was asked and can be told to fail. */
export class FakeCommandWrites {
  created: Array<{ data: NewUser; assignments: UserAssignment[] }> = [];
  updated: Array<{ code: string; data: object; assignments: UserAssignment[] | null }> = [];
  failWith: unknown = null;
  async create(data: NewUser, assignments: UserAssignment[]): Promise<UserRecord> {
    if (this.failWith) throw this.failWith;
    this.created.push({ data, assignments });
    return userRecord({ id: 'u-new', employeeCode: data.employeeCode, fullName: data.fullName, email: data.email, authType: data.authType });
  }
  async update(code: string, data: object, assignments: UserAssignment[] | null): Promise<UserRecord> {
    if (this.failWith) throw this.failWith;
    this.updated.push({ code, data, assignments });
    return userRecord({ id: 'u-existing', employeeCode: code });
  }
}
