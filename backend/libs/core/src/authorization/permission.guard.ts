/**
 * @file    permission.guard.ts
 * @module  AuthorizationModule
 *
 * @description
 * The guard that checks the permission on every API call. In plain words: before any route runs, this checks that the person is signed in and their role allows it; if not, the call is refused and written to the security log.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.5 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.5.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/permission.guard.ts
 * @lld-synced     v0.5
 * @status         pseudo
 */

import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditService } from '@libs/audit';
import { PermissionResolver } from './permission-resolver.service';
import { PUBLIC_ROUTE_KEY, REQUIRE_PERMISSION_KEY, SessionUser } from './session-user.interface';

/**
 * Global guard: permission check on every route.
 *
 * In plain words: the doorkeeper for all API calls. The screen can hide a button, but only this decides.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none (all)
 *   lld:       LLD-EPIC-ADM-01 v0.5 §6.8
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly resolver: PermissionResolver,
    private readonly audit: AuditService,
  ) {}

  /**
   * Allows or refuses one call.
   *
   * In plain words: open routes pass; every other route needs a signed-in user whose role allows what the route asks for.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-02
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.5 §6.8
 * @status    pseudo
   *
   * @dependencies Reflector.getAllAndOverride, PermissionResolver.resolve, PermissionGuard.refuse
   *
   * @async
   * @param context - The call being made
   * @returns True when the call may go on
   * @throws {UnauthorizedException} No valid session (HTTP 401, code UNAUTHENTICATED)
   * @throws {ForbiddenException} Not allowed, or the route declares no permission (HTTP 403, code FORBIDDEN)
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // TODO: 1. If the route or its controller carries PUBLIC_ROUTE_KEY, return true.
    // TODO: 2. user = request.sessionUser; if missing, throw UnauthorizedException({ code: 'UNAUTHENTICATED' }).
    // TODO: 3. key = metadata REQUIRE_PERMISSION_KEY of the route, else of the controller.
    // TODO: 4. If there is no key, refuse: this.refuse(user, 'none', 'NO_PERMISSION_DECLARED') (decision L-02).
    // TODO: 5. access = await this.resolver.resolve(user, key); if not allowed, this.refuse(user, key, 'FORBIDDEN').
    // TODO: 6. Put access.scope on the request (request.dataScope) for DataScopeFilter; return true.
    throw new Error('pseudo-code: not implemented');
  }

  /**
   * Writes the refusal to the security log and stops the call.
   *
   * In plain words: records who tried what, then answers "not allowed".
   *
   * @story   US-ADM01-017
   * @subtask ST-ADM01-017-BE-02
   * @dependencies AuditService.recordRefusal
   *
   * @throws {ForbiddenException} Always (HTTP 403)
   */
  private async refuse(user: SessionUser, permissionKey: string, code: string): Promise<never> {
    // TODO: 1. await this.audit.recordRefusal({ userId, companyCode, permissionKey, code }).
    // TODO: 2. throw new ForbiddenException({ code, message: 'You do not have permission to do this.' }).
    throw new Error('pseudo-code: not implemented');
  }
}
