/**
 * @file    require-permission.decorator.ts
 * @module  AuthorizationModule
 *
 * @description
 * The tag that names the permission a route needs. In plain words: each route says which right a user must have to call it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.5 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.5.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/require-permission.decorator.ts
 * @lld-synced     v0.5
 * @status         pseudo
 */

import { SetMetadata } from '@nestjs/common';
import { REQUIRE_PERMISSION_KEY } from './session-user.interface';

/**
 * Marks a route (or a controller) with the permission it needs.
 *
 * In plain words: write `@RequirePermission('users.manage')` above a route and
 * only users whose role allows `users.manage` can call it.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 §6.8
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-01
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.5 §6.8
 * @status    pseudo
 *
 * @dependencies SetMetadata
 *
 * @param permissionKey - The permission, as `<area>.<action>`, for example `users.view`
 * @returns A decorator that stores the key for `PermissionGuard`
 * @example
 *   @RequirePermission('roles.manage')
 *   @Put(':roleId')
 *   update() {}
 */
export const RequirePermission = (permissionKey: string): MethodDecorator & ClassDecorator => {
  // TODO: 1. Return SetMetadata(REQUIRE_PERMISSION_KEY, permissionKey).
  throw new Error('pseudo-code: not implemented');
};
