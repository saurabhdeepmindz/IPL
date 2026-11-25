/**
 * @file    dev-probe.controller.ts
 * @module  AmsApis
 *
 * @description
 * Test-only routes for the API contract tests of US-ADM01-017. In plain words: a few small routes with known permissions, so that pytest can prove the guards work before the real users and roles routes exist. Registered only when APP_ENV is dev or test.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.8 (C-07)
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/controllers/dev-probe.controller.ts
 * @lld-synced     v0.19
 * @status         built
 * @story          US-ADM01-017
 * @subtask        ST-ADM01-017-BE-06
 */
import { Controller, Get, Req } from '@nestjs/common';
import { okResponse } from '@libs/common';
import { DataScopeFilter, Public, RequirePermission, SessionUser } from '@libs/core';
import { DataScope } from '@libs/database';

/** What a scoped probe request carries after the guards. */
type ProbeRequest = { user: SessionUser; dataScope?: DataScope | null };

/**
 * Test-only probe routes.
 *
 * In plain words: stand-ins for the users, roles and matrix routes of later stories.
 *
 * TBD-ADM01-02: removed when US-ADM01-011 and the other real users routes are built. The matrix route was removed with US-ADM01-014 (decision L-26).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.19 section 6.8
 */
@Controller('dev/probe')
export class DevProbeController {
  constructor(private readonly scopeFilter: DataScopeFilter) {}

  /** A route that needs `users.view`. In plain words: stands in for the users list. */
  @RequirePermission('users.view')
  @Get('users')
  users(): unknown {
    return okResponse({ route: 'users' });
  }

  /** A route that needs `users.manage`. */
  @RequirePermission('users.manage')
  @Get('users-manage')
  usersManage(): unknown {
    return okResponse({ route: 'users-manage' });
  }

  /** A route that needs `roles.manage`. */
  @RequirePermission('roles.manage')
  @Get('roles-manage')
  rolesManage(): unknown {
    return okResponse({ route: 'roles-manage' });
  }

  /** A route that declares nothing. In plain words: must be refused with NO_PERMISSION_DECLARED. */
  @Get('undeclared')
  undeclared(): unknown {
    return okResponse({ route: 'undeclared' });
  }

  /** An open route. */
  @Public()
  @Get('open')
  open(): unknown {
    return okResponse({ route: 'open' });
  }

  /**
   * A scoped list. In plain words: shows the where-fragment the data scope gives the caller.
   *
   * @param req The request after the guards
   * @returns The scope and the fragment
   * @dependencies DataScopeFilter.toWhere
   */
  @RequirePermission('users.view')
  @Get('scoped')
  scoped(@Req() req: ProbeRequest): unknown {
    const where = this.scopeFilter.toWhere(req.dataScope ?? null, req.user, { ownerField: 'createdBy', departmentField: 'departmentId' });
    return okResponse({ scope: req.dataScope ?? null, where });
  }
}
