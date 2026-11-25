/**
 * @file    public.decorator.ts
 * @module  AuthorizationModule
 *
 * @description
 * The tag for a route that needs no sign-in. In plain words: the few open routes, such as sign-in and the health check, say so on purpose.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.15 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.15.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/public.decorator.ts
 * @lld-synced     v0.15
 * @status         built
 */

import { SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE_KEY } from './session-user.interface';

/**
 * Marks a route as open. Without this tag or `@RequirePermission`, every route is refused (decision L-02).
 *
 * In plain words: nothing is open by accident; an open route has to be marked.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.15 §6.8
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-01
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.15 §6.8
 * @status    built
 *
 * @dependencies SetMetadata
 *
 * @returns A decorator that stores the "open route" mark for both guards
 */
export const Public = (): MethodDecorator & ClassDecorator => {
  return SetMetadata(PUBLIC_ROUTE_KEY, true);
};
