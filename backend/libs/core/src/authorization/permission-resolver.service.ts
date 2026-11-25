/**
 * @file    permission-resolver.service.ts
 * @module  AuthorizationModule
 *
 * @description
 * Works out whether a user may do something. In plain words: finds the roles the user holds today in the session company and checks what those roles allow.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/permission-resolver.service.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { DataScope, RoleStatus } from '@libs/database';
import { UserCompanyRoleRepository } from '@libs/organisation';
import { RolePermissionRepository } from '@libs/roles-and-permissions';
import { PermissionCache, roleCellsKey, userRolesKey } from './permission.cache';

type Cell = { key: string; allowed: boolean; scope: DataScope | null };

/** Widest first: COMPANY reaches further than DEPARTMENT, which reaches further than OWN. */
const WIDEST_FIRST: DataScope[] = [DataScope.COMPANY, DataScope.DEPARTMENT, DataScope.OWN];
import { ResolvedAccess, SessionUser } from './session-user.interface';

/**
 * Decides allowed or refused, and how far the data scope reaches.
 *
 * In plain words: the single place that answers "may this person do this?".
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.29 §6.8
 */
@Injectable()
export class PermissionResolver {
  constructor(
    private readonly userRoles: UserCompanyRoleRepository,
    private readonly rolePermissions: RolePermissionRepository,
    private readonly cache: PermissionCache,
  ) {}

  /**
   * Answers whether the user may use the permission in the session company.
   *
   * In plain words: looks at every role the user holds today in this company; if any of them allows it, the answer is yes, and the widest scope wins.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-02
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.8
 * @status    built
   *
   * @dependencies PermissionResolver.rolesOf, PermissionResolver.cellsOf
   *
   * @param user - The signed-in user
   * @param permissionKey - For example `users.manage`
   * @returns Allowed or not, and the widest data scope
   */
  async resolve(user: SessionUser, permissionKey: string): Promise<ResolvedAccess> {
    const roleIds = await this.rolesOf(user);
    if (roleIds.length === 0) return { allowed: false, scope: null };
    const cells = await this.cellsOf(roleIds);
    const granting = cells.filter((c) => c.key === permissionKey && c.allowed);
    if (granting.length === 0) return { allowed: false, scope: null };
    const scope = WIDEST_FIRST.find((w) => granting.some((c) => c.scope === w)) ?? null;
    return { allowed: true, scope };
  }

  /**
   * The roles the user holds in the session company that are valid today and Active.
   *
   * In plain words: a role whose end date has passed, or that was deactivated, no longer counts.
   *
   * @story   US-ADM01-017
   * @subtask ST-ADM01-017-BE-02
   * @dependencies PermissionCache.get, PermissionCache.set, UserCompanyRoleRepository.listByUser
   */
  private async rolesOf(user: SessionUser): Promise<string[]> {
    const cacheKey = userRolesKey(user.userId, user.companyCode);
    const cached = await this.cache.get<string[]>(cacheKey);
    if (cached) return cached;
    const today = new Date();
    const rows = await this.userRoles.listByUser(user.userId, user.companyCode, today);
    const roleIds = rows
      .filter((r) => r.roleStatus === RoleStatus.ACTIVE && (r.validTo === null || r.validTo >= today))
      .map((r) => r.roleId);
    await this.cache.set(cacheKey, roleIds);
    return roleIds;
  }

  /**
   * The permission cells of the given roles.
   *
   * In plain words: what each of these roles is allowed to do.
   *
   * @story   US-ADM01-017
   * @subtask ST-ADM01-017-BE-02
   * @dependencies PermissionCache.get, PermissionCache.set, RolePermissionRepository.listForRole
   */
  private async cellsOf(roleIds: string[]): Promise<Array<{ key: string; allowed: boolean; scope: DataScope | null }>> {
    const all: Cell[] = [];
    for (const roleId of roleIds) {
      const cached = await this.cache.get<Cell[]>(roleCellsKey(roleId));
      const cells = cached ?? (await this.rolePermissions.listForRole(roleId));
      if (!cached) await this.cache.set(roleCellsKey(roleId), cells);
      all.push(...cells);
    }
    return all;
  }
}
