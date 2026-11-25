/**
 * @file    roles.fakes.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Test helpers of the roles service specs. In plain words: small in-memory fakes of the role repository, the cell repository and the audit service, so the service tests need no database.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-06
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/services/roles.fakes.ts
 * @lld-synced     v0.25
 * @status         built
 */

import { RoleStatus } from '@libs/database';
import { RoleCellInput, RoleFields, RoleFilter, RoleRecord } from '../repositories/role';

/** One role record with sensible defaults. */
export const roleRecord = (over: Partial<RoleRecord> & { id: string; name: string }): RoleRecord => ({
  code: over.name.toUpperCase().replace(/\W+/g, '_'),
  description: 'd',
  type: 'CUSTOM',
  status: RoleStatus.ACTIVE,
  isLocked: false,
  updatedAt: new Date('2026-11-25T00:00:00Z'),
  userCount: 0,
  ...over,
});

/** The six SOW roles; Administrator is locked. */
export const SIX_ROLES: RoleRecord[] = ['Initiator', 'Processor', 'Finance', 'Administrator', 'Report Viewer', 'Auditor'].map((name, n) =>
  roleRecord({ id: `std-${n}`, name, type: 'STANDARD', isLocked: name === 'Administrator', code: name === 'Administrator' ? 'ADMINISTRATOR' : name.toUpperCase().replace(/\W+/g, '_') }),
);

/** In-memory role repository. */
export class FakeRoleRepo {
  roles: RoleRecord[] = [...SIX_ROLES];
  holders: Record<string, number> = {};
  created: Array<{ fields: RoleFields; cells: RoleCellInput[] }> = [];
  updated: Array<{ roleId: string; fields: RoleFields; cells: RoleCellInput[] | null }> = [];
  statusSet: Array<{ roleId: string; status: RoleStatus }> = [];

  async findPage(filter: RoleFilter): Promise<RoleRecord[]> {
    return this.roles.filter(
      (r) => (!filter.type || r.type === filter.type) && (!filter.status || r.status === filter.status) && (!filter.q || r.name.toLowerCase().includes(filter.q.toLowerCase())),
    );
  }
  async findById(roleId: string): Promise<RoleRecord | null> {
    return this.roles.find((r) => r.id === roleId) ?? null;
  }
  async findByName(name: string): Promise<RoleRecord | null> {
    return this.roles.find((r) => r.name.toLowerCase() === name.toLowerCase()) ?? null;
  }
  async createWithCells(fields: RoleFields, cells: RoleCellInput[]): Promise<RoleRecord> {
    this.created.push({ fields, cells });
    const role = roleRecord({ id: `new-${this.created.length}`, ...fields });
    this.roles.push(role);
    return role;
  }
  async updateWithCells(roleId: string, fields: RoleFields, cells: RoleCellInput[] | null): Promise<RoleRecord> {
    this.updated.push({ roleId, fields, cells });
    return { ...(this.roles.find((r) => r.id === roleId) as RoleRecord), ...fields };
  }
  async setStatus(roleId: string, status: RoleStatus): Promise<RoleRecord> {
    this.statusSet.push({ roleId, status });
    return { ...(this.roles.find((r) => r.id === roleId) as RoleRecord), status };
  }
  async countHolders(roleId: string): Promise<number> {
    return this.holders[roleId] ?? 0;
  }
}

/** In-memory cell repository. */
export class FakeCellRepo {
  byRole: Record<string, Array<{ key: string; allowed: boolean; scope: 'OWN' | 'DEPARTMENT' | 'COMPANY' | null }>> = {};
  async listForRole(roleId: string) {
    return this.byRole[roleId] ?? [];
  }
}
