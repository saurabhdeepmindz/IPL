/**
 * @file    roles.controller.ts
 * @module  RolesApi
 *
 * @description
 * Role routes (API-ROL-01 to API-ROL-04). In plain words: thin; each route names its permission and passes the call to the service. The routes of US-ADM01-011 (`getOne`, `assignUsers`) are added to this class by that story.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/controllers/roles.controller.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { NotFoundAppException, okResponse } from '@libs/common';
import { RequirePermission, SessionUser } from '@libs/core';
import { RoleCellInput, RolesService } from '@libs/roles-and-permissions';
import { DeactivateRoleDto } from '../dtos/roles/deactivate-role.dto';
import { ListRolesQueryDto } from '../dtos/roles/list-roles-query.dto';
import { toRoleResponse } from '../dtos/roles/role-response.dto';
import { SaveRoleDto } from '../dtos/roles/save-role.dto';

/**
 * Roles controller.
 *
 * In plain words: turns the four role calls into service calls and wraps the answers.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-010
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 *   contracts: API-ROL-01 to API-ROL-04
 *   lld:       LLD-EPIC-ADM-01 v0.29 §6.4
 */
/** `:roleId` must be a UUID; anything else is "no such role", so `permissions` is never read as a role id (decision L-16). */
const roleIdPipe = new ParseUUIDPipe({ exceptionFactory: () => new NotFoundAppException('ROLE_NOT_FOUND', 'No such role') });

/** The cells of a save, or null when none were sent. */
const toCells = (dto: SaveRoleDto): RoleCellInput[] | null =>
  dto.permissions ? dto.permissions.map((c) => ({ permissionKey: c.permissionKey, allowed: c.allowed, scope: c.scope ?? null })) : null;

// Note (decision L-16): PermissionMatrixController (US-ADM01-014) uses the path `roles/permissions`. It must be listed BEFORE this controller in the
// module, and every `:roleId` here is checked by ParseUUIDPipe, so `permissions` is never read as a role id.
@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  /**
   * GET /roles.
   *
   * In plain words: lists the roles for the Role Management screen.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-01
 * @ac        AC-US010-01, AC-US010-07
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.4
 * @status    built
   *
   * @dependencies RolesService.list
   *
   * @param query - the filters
   * @returns `{ data: { items } }`
   */
  @RequirePermission('roles.view')
  @ApiOperation({ summary: 'List roles (API-ROL-01)' })
  @Get()
  async list(@Query() query: ListRolesQueryDto): Promise<unknown> {
    return okResponse({ items: (await this.roles.list(query)).map(toRoleResponse) });
  }

  /**
   * POST /roles.
   *
   * In plain words: creates a role.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-02
 * @ac        AC-US010-02, AC-US010-03, AC-US010-06
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.4
 * @status    built
   *
   * @dependencies RolesService.create
   *
   * @param dto - the role to create
   * @param req - the request, for the signed-in user
   * @returns `201 { data: { roleId } }`
   */
  @RequirePermission('roles.manage')
  @ApiOperation({ summary: 'Create a role (API-ROL-02)' })
  @Post()
  async create(@Body() dto: SaveRoleDto, @Req() req: { user: SessionUser }): Promise<unknown> {
    const fields = { name: dto.name, description: dto.description, status: dto.status };
    const role = await this.roles.create(fields, dto.copyFromRoleId ?? null, toCells(dto) ?? [], req.user.userId, dto.reason);
    return okResponse({ roleId: role.id });
  }

  /**
   * PUT /roles/:roleId.
   *
   * In plain words: changes a role.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-03
 * @ac        AC-US010-04, AC-US010-06
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.4
 * @status    built
   *
   * @dependencies RolesService.update
   *
   * @param roleId - the role (a UUID)
   * @param dto - the new values
   * @param req - the request
   * @returns `200 { data: role }`
   */
  @RequirePermission('roles.manage')
  @ApiOperation({ summary: 'Change a role (API-ROL-03)' })
  @Put(':roleId')
  async update(@Param('roleId', roleIdPipe) roleId: string, @Body() dto: SaveRoleDto, @Req() req: { user: SessionUser }): Promise<unknown> {
    const fields = { name: dto.name, description: dto.description, status: dto.status };
    return okResponse(toRoleResponse(await this.roles.update(roleId, fields, toCells(dto), req.user.userId, dto.reason)));
  }

  /**
   * POST /roles/:roleId/deactivate.
   *
   * In plain words: deactivates a role that nobody holds.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-010
 * @subtask   ST-ADM01-010-BE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-04
 * @ac        AC-US010-04, AC-US010-05
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.4
 * @status    built
   *
   * @dependencies RolesService.deactivate
   *
   * @param roleId - the role (a UUID)
   * @param dto - the reason
   * @param req - the request
   * @returns `200 { data: { status: "INACTIVE" } }`
   */
  @RequirePermission('roles.manage')
  @ApiOperation({ summary: 'Deactivate a role (API-ROL-04)' })
  @HttpCode(200)
  @Post(':roleId/deactivate')
  async deactivate(@Param('roleId', roleIdPipe) roleId: string, @Body() dto: DeactivateRoleDto, @Req() req: { user: SessionUser }): Promise<unknown> {
    const role = await this.roles.deactivate(roleId, req.user.userId, dto.reason);
    return okResponse({ status: role.status });
  }
}
