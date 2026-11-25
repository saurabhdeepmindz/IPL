/**
 * @file    role-assignment.fakes.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Test helpers of the role assignment service spec. In plain words: in-memory stand-ins for the holders repository and the user repository, and a small set of roles and users.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/services/role-assignment.fakes.ts
 * @lld-synced     v0.23
 * @status         built
 */

import { RoleStatus } from '@libs/database';
import { RoleHolderRow, NewAssignment } from '@libs/organisation';
import { UserRef } from '@libs/users';
import { roleRecord } from './roles.fakes';
import { FakeRoleRepo } from './roles.fakes';

/** The roles: Report Viewer and Initiator (Active), a Draft one and an Inactive one. */
export class AssignRoleRepo extends FakeRoleRepo {
  constructor() {
    super();
    this.roles = [
      roleRecord({ id: 'rv', name: 'Report Viewer', code: 'REPORT_VIEWER', type: 'STANDARD' }),
      roleRecord({ id: 'init', name: 'Initiator', code: 'INITIATOR', type: 'STANDARD' }),
      roleRecord({ id: 'draft', name: 'Draft role', status: RoleStatus.DRAFT }),
      roleRecord({ id: 'old', name: 'Old role', status: RoleStatus.INACTIVE }),
    ];
  }
}

/** Three users: two Active and one Inactive. */
export const USERS: UserRef[] = [
  { id: 'u1', employeeCode: '10011', fullName: 'First User', status: 'ACTIVE', departmentName: 'Finance' },
  { id: 'u2', employeeCode: '10012', fullName: 'Second User', status: 'ACTIVE', departmentName: null },
  { id: 'u3', employeeCode: '10013', fullName: 'Gone User', status: 'INACTIVE', departmentName: null },
];

/** User repository fake. */
export class FakeUsers {
  async findByCodes(codes: string[]): Promise<UserRef[]> {
    return USERS.filter((u) => codes.includes(u.employeeCode));
  }
}

/** Holders repository fake: the assignments made so far. */
export class FakeHolders {
  rows: Array<NewAssignment & { assignedOn: Date }> = [];
  lastListCompany: string | null | undefined;
  inserted: NewAssignment[][] = [];

  async listByRole(roleId: string, companyCode: string | null): Promise<RoleHolderRow[]> {
    this.lastListCompany = companyCode;
    return this.rows
      .filter((r) => r.roleId === roleId && (companyCode === null || r.companyCode === companyCode))
      .map((r) => {
        const u = USERS.find((x) => x.id === r.userId) as UserRef;
        return { employeeCode: u.employeeCode, fullName: u.fullName, departmentName: u.departmentName, companyCode: r.companyCode, assignedOn: r.assignedOn };
      });
  }
  async findHolders(roleId: string, companyCode: string, userIds: string[]): Promise<string[]> {
    return this.rows.filter((r) => r.roleId === roleId && r.companyCode === companyCode && userIds.includes(r.userId)).map((r) => r.userId);
  }
  async insertMany(rows: NewAssignment[]): Promise<number> {
    this.inserted.push(rows);
    this.rows.push(...rows.map((r) => ({ ...r, assignedOn: new Date('2026-11-25T08:00:00Z') })));
    return rows.length;
  }
  give(userId: string, roleId: string, companyCode = 'IPL'): void {
    this.rows.push({ userId, roleId, companyCode, validFrom: new Date('2026-01-01'), assignedBy: '10001', assignedOn: new Date('2026-02-01T00:00:00Z') });
  }
}
