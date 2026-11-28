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
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/controllers/users.controller.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { Body, Controller, Get, Param, Post, Put, Query, Req, UseInterceptors } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { okResponse } from '@libs/common';
import { RequirePermission, SessionUser } from '@libs/core';
import { UserDetails, UserInput, UserRecord, UsersCommandService, UsersQueryService } from '@libs/users';
import { ListUsersQueryDto } from '../../dtos/users/list-users-query.dto';
import { CreateUserDto } from '../../dtos/users/create-user.dto';
import { UpdateUserDto } from '../../dtos/users/update-user.dto';
import { UserDetailsDto, UserListItemDto } from '../../dtos/users/user-response.dto';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';

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
 *   lld:       LLD-EPIC-ADM-01 v0.24 section 6.1
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

/** One user with the details screen's extra fields. */
const toDetails = (d: UserDetails): UserDetailsDto => ({
  ...toItem(d.user),
  firstSignInAt: d.user.firstSignInAt ? d.user.firstSignInAt.toISOString() : null,
  signInLocked: d.signInLocked,
  summaryText: d.summaryText,
  activity: d.activity.map((a) => ({ at: a.at.toISOString(), text: a.text })),
  form: d.form,
});

/** The body of create or change as the service input (dates become Date). */
const toInput = (dto: CreateUserDto, employeeCode: string, newEmployeeCode?: string): UserInput => ({
  employeeCode,
  ...(newEmployeeCode === undefined ? {} : { newEmployeeCode }),
  fullName: dto.fullName,
  email: dto.email,
  mobile: dto.mobile ?? null,
  departmentId: dto.departmentId,
  designationId: dto.designationId,
  reportingManagerCode: dto.reportingManagerCode ?? null,
  signIn: dto.signIn,
  companies: dto.companies.map((c) => ({ companyCode: c.companyCode, roleIds: c.roleIds, validFrom: new Date(c.validFrom), validTo: c.validTo ? new Date(c.validTo) : null })),
});

@Controller('users')
export class UsersController {
  constructor(
    private readonly query: UsersQueryService,
    private readonly command: UsersCommandService,
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
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
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

  /**
   * GET /users/:employeeCode.
   *
   * In plain words: one user with the companies, the access sentence and the latest changes.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-01
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-03
 * @ac        AC-US003-03
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies UsersQueryService.getDetails
   *
   * @param employeeCode - the user
   * @returns `{ data: details }`
   */
  @RequirePermission('users.view')
  @ApiOperation({ summary: 'Read a user (API-USR-03)' })
  @Get(':employeeCode')
  async getOne(@Param('employeeCode') employeeCode: string): Promise<unknown> {
    return okResponse(toDetails(await this.query.getDetails(employeeCode)));
  }

  /**
   * POST /users.
   *
   * In plain words: creates a user; a repeated click with the same key returns the first answer.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-01
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02
 * @ac        AC-US003-01, AC-US003-02, AC-US003-05
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies UsersCommandService.create
   *
   * @param dto - the user
   * @param req - the request (the signed-in Administrator)
   * @returns `{ data: { employeeCode, status, oneTimePassword } }` (HTTP 201)
   */
  @RequirePermission('users.manage')
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Create a user (API-USR-02)' })
  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: { user: SessionUser }): Promise<unknown> {
    return okResponse(await this.command.create(toInput(dto, dto.employeeCode), req.user.userId, req.user.employeeCode));
  }

  /**
   * PUT /users/:employeeCode.
   *
   * In plain words: changes a user; the employee code can be corrected only before the first sign-in.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-01
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-04
 * @ac        AC-US003-04
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies UsersCommandService.update, UsersQueryService.getDetails
   *
   * @param employeeCode - the user
   * @param dto - the user fields and an optional `newEmployeeCode`
   * @param req - the request (the signed-in Administrator)
   * @returns `{ data: details }`
   */
  @RequirePermission('users.manage')
  @ApiOperation({ summary: 'Change a user (API-USR-04)' })
  @Put(':employeeCode')
  async update(@Param('employeeCode') employeeCode: string, @Body() dto: UpdateUserDto, @Req() req: { user: SessionUser }): Promise<unknown> {
    const saved = await this.command.update(employeeCode, toInput(dto, employeeCode, dto.newEmployeeCode), req.user.userId, req.user.employeeCode);
    return okResponse(toDetails(await this.query.getDetails(saved.employeeCode)));
  }
}
