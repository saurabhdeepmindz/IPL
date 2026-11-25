/**
 * @file    users.controller.ts
 * @module  UsersApi
 *
 * @description
 * User routes: list, read, create and change (API-USR-01 to API-USR-04). In plain words: thin; each route names its permission and passes the call to a service. The deactivate, unlock and password routes are in `UsersLifecycleController` (decision L-40 applies: files stay under 250 lines).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-001, US-ADM01-003
 * @subtask        ST-ADM01-001-BE-01, ST-ADM01-003-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.14 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.14.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/controllers/users.controller.ts
 * @lld-synced     v0.14
 * @status         elaborated
 */

import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { okResponse } from '@libs/common';
import { RequirePermission, SessionUser } from '@libs/core';
import { UserRecord, UsersQueryService } from '@libs/users';
import { ListUsersQueryDto } from '../dtos/users/list-users-query.dto';
import { UserListItemDto } from '../dtos/users/user-response.dto';

/**
 * Users controller.
 *
 * In plain words: turns four user calls into service calls and wraps the answers.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-001, US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7, FR-042.1, FR-042.4, FR-042.6, FR-043.2
 *   contracts: API-USR-01 to API-USR-04
 *   lld:       LLD-EPIC-ADM-01 v0.14 section 6.1
 */
/** One user of the list as the screen shows it. */
const toItem = (u: UserRecord): UserListItemDto => ({
  employeeCode: u.employeeCode,
  name: u.fullName,
  email: u.email,
  department: u.departmentName,
  designation: u.designationName,
  companies: u.companies,
  signIn: u.authType,
  status: u.status,
  lastSignIn: u.lastSignInAt ? u.lastSignInAt.toISOString() : null,
});

@Controller('users')
export class UsersController {
  constructor(
    private readonly query: UsersQueryService,
  ) {}

  /**
   * GET /users.
   *
   * In plain words: the user list for the User Management screen.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-001
 * @subtask   ST-ADM01-001-BE-01
 * @frd       FR-042.1, FR-042.4, FR-042.6, FR-043.2
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-01
 * @ac        AC-US001-01, AC-US001-02, AC-US001-03, AC-US001-05
 * @lld       LLD-EPIC-ADM-01 v0.14 §6.1
 * @status    pseudo
   *
   * @dependencies UsersQueryService.search
   *
   * @param query - the filters
   * @param req - the request (the company guard marks `allCompanies` for ALL)
   * @returns `{ data: list }`
   */
  @RequirePermission('users.view')
  @ApiOperation({ summary: 'List users (API-USR-01)' })
  @Get()
  async list(@Query() query: ListUsersQueryDto, @Req() req: { user: SessionUser; allCompanies?: boolean }): Promise<unknown> {
    const { status = 'all', q, departmentId, roleId, signIn, page = 1, pageSize = 25, sort = 'name:asc' } = query;
    const ctx = { sessionCompany: req.user.companyCode, allCompanies: req.allCompanies === true, actor: req.user.userId };
    const out = await this.query.search({ status, q, departmentId, roleId, signIn, page, pageSize, sort }, ctx);
    return okResponse({ items: out.items.map(toItem), counts: out.counts, page: out.page, pageSize: out.pageSize, total: out.total });
  }
}
