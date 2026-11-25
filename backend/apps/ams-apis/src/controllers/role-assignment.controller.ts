/**
 * @file    role-assignment.controller.ts
 * @module  RolesApi
 *
 * @description
 * Role assignment routes (API-ROL-05, API-ROL-06). In plain words: thin; each route names its permission and passes the call to the service. A separate controller from `RolesController` because that file would pass 250 lines (decision L-40). Both use the path `roles`.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/controllers/role-assignment.controller.ts
 * @lld-synced     v0.24
 * @status         built
 */

import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { NotFoundAppException, okResponse } from '@libs/common';
import { RequirePermission, SessionUser } from '@libs/core';
import { RoleAssignmentService } from '@libs/roles-and-permissions';
import { AssignUsersDto } from '../dtos/roles/assign-users.dto';
import { RoleDetailsQueryDto } from '../dtos/roles/role-details-query.dto';
import { toRoleResponse } from '../dtos/roles/role-response.dto';

/** `:roleId` must be a UUID; anything else is "no such role" (same rule as RolesController). */
const roleIdPipe = new ParseUUIDPipe({ exceptionFactory: () => new NotFoundAppException('ROLE_NOT_FOUND', 'No such role') });

/**
 * Role assignment controller.
 *
 * In plain words: turns the two calls into service calls and wraps the answers.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-05, API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.24 §6.4
 */
@Controller('roles')
export class RoleAssignmentController {
  constructor(private readonly assignment: RoleAssignmentService) {}

  /**
   * GET /roles/:roleId.
   *
   * In plain words: shows one role with the people who hold it and what it allows.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-011
 * @subtask   ST-ADM01-011-BE-01
 * @frd       FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-05
 * @ac        AC-US011-02
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.4
 * @status    built
   *
   * @dependencies RoleAssignmentService.getDetails
   *
   * @param roleId - the role (a UUID)
   * @param query - the optional company
   * @param req - the request (the company guard marks `allCompanies` for ALL)
   * @returns `{ data: details }`
   */
  @RequirePermission('roles.view')
  @ApiOperation({ summary: 'Show a role and who holds it (API-ROL-05)' })
  @Get(':roleId')
  async getOne(@Param('roleId', roleIdPipe) roleId: string, @Query() query: RoleDetailsQueryDto, @Req() req: { user: SessionUser; allCompanies?: boolean }): Promise<unknown> {
    const company = req.allCompanies ? null : req.user.companyCode;
    const d = await this.assignment.getDetails(roleId, company);
    const users = d.users.map((u) => ({ ...u, assignedOn: u.assignedOn.toISOString() }));
    return okResponse({ ...toRoleResponse(d.role), users, allows: d.allows });
  }

  /**
   * POST /roles/:roleId/users.
   *
   * In plain words: gives the role to users in the session company.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-011
 * @subtask   ST-ADM01-011-BE-01
 * @frd       FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-06
 * @ac        AC-US011-01, AC-US011-03
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.4
 * @status    built
   *
   * @dependencies RoleAssignmentService.assignUsers
   *
   * @param roleId - the role (a UUID)
   * @param dto - codes, company, first day, reason
   * @param req - the request, for the signed-in user
   * @returns `200 { data: { assigned } }`
   */
  @RequirePermission('roles.manage')
  @HttpCode(200)
  @ApiOperation({ summary: 'Give a role to users (API-ROL-06)' })
  @Post(':roleId/users')
  async assignUsers(@Param('roleId', roleIdPipe) roleId: string, @Body() dto: AssignUsersDto, @Req() req: { user: SessionUser }): Promise<unknown> {
    const input = { roleId, employeeCodes: dto.employeeCodes, companyCode: dto.companyCode, validFrom: new Date(dto.validFrom), reason: dto.reason };
    return okResponse(await this.assignment.assignUsers(input, req.user.companyCode, req.user.userId, req.user.employeeCode));
  }
}
