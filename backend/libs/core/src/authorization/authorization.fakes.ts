/**
 * @file    authorization.fakes.ts
 * @module  AuthorizationModule
 *
 * @description
 * Test helpers shared by the guard specs. In plain words: small fakes of the repositories, the cache and the request, so the guard tests need no database and no Redis.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/authorization.fakes.ts
 * @lld-synced     v0.26
 * @status         built
 */

import { ExecutionContext } from '@nestjs/common';
import { DataScope, RoleStatus } from '@libs/database';
import { Public } from './public.decorator';
import { RequirePermission } from './require-permission.decorator';

/** Fake stores, so the tests need no database and no Redis. */
export const DAY = 24 * 60 * 60 * 1000;
export type RoleRow = { roleId: string; roleCode: string; roleStatus: RoleStatus; validFrom: Date; validTo: Date | null };
export type Cell = { key: string; allowed: boolean; scope: DataScope | null };

export class FakeRoles {
  rows: RoleRow[] = [];
  async listByUser(): Promise<RoleRow[]> {
    return this.rows;
  }
}
export class FakeCells {
  byRole: Record<string, Cell[]> = {};
  async listForRole(roleId: string): Promise<Cell[]> {
    return this.byRole[roleId] ?? [];
  }
}
export class FakeCache {
  store = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | null> {
    return (this.store.has(key) ? this.store.get(key) : null) as T | null;
  }
  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
  }
  async clearAll(): Promise<void> {
    this.store.clear();
  }
}

export const sessionUser = { userId: 'u-1', employeeCode: '10002', companyCode: 'IPL', departmentId: null };
export const activeRole = (roleId: string, validTo: Date | null = null): RoleRow => ({
  roleId,
  roleCode: roleId,
  roleStatus: RoleStatus.ACTIVE,
  validFrom: new Date(Date.now() - 30 * DAY),
  validTo,
});

export class Routes {
  @RequirePermission('users.manage')
  usersRoute(): void {}

  @Public()
  openRoute(): void {}

  undeclaredRoute(): void {}
}

export function contextFor(handler: () => void, request: Record<string, unknown>): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => Routes,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

