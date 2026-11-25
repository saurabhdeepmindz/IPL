/**
 * @file    permission-matrix.controller.ts
 * @module  RolesApi
 *
 * @description
 * Permission matrix routes (API-PRM-01 to API-PRM-03). In plain words: thin; each route names its permission and passes the call to the service. It is listed before `RolesController` in the module, because `PUT /roles/permissions` would otherwise be read as `PUT /roles/:roleId` (decision L-16).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.16 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.16.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/controllers/permission-matrix.controller.ts
 * @lld-synced     v0.16
 * @status         built
 */

import { Body, Controller, Get, HttpCode, Post, Put, Query, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { okResponse } from '@libs/common';
import { RequirePermission, SessionUser } from '@libs/core';
import { PermissionMatrixService } from '@libs/roles-and-permissions';
import { MatrixQueryDto } from '../dtos/permissions/matrix-query.dto';
import { ReviewChangesDto } from '../dtos/permissions/review-changes.dto';
import { SaveChangesDto } from '../dtos/permissions/save-changes.dto';

/**
 * Permission matrix controller.
 *
 * In plain words: turns the three matrix calls into service calls and wraps the answers.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-01, API-PRM-02, API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.16 §6.6
 */
@Controller('roles/permissions')
export class PermissionMatrixController {
  constructor(private readonly matrix: PermissionMatrixService) {}

  /**
   * GET /roles/permissions/matrix.
   *
   * In plain words: serves the matrix for the Permission Management screen.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US014-01
 * @lld       LLD-EPIC-ADM-01 v0.16 §6.6
 * @status    built
   *
   * @dependencies PermissionMatrixService.getMatrix
   *
   * @param query - the optional module and text
   * @returns `{ data: matrix }`
   */
  @RequirePermission('roles.view')
  @ApiOperation({ summary: 'Read the permission matrix (API-PRM-01)' })
  @Get('matrix')
  async getMatrix(@Query() query: MatrixQueryDto): Promise<unknown> {
    return okResponse(await this.matrix.getMatrix(query));
  }

  /**
   * POST /roles/permissions/review.
   *
   * In plain words: previews what the changes would do and saves nothing.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-02
 * @ac        AC-US014-03, AC-US014-05
 * @lld       LLD-EPIC-ADM-01 v0.16 §6.6
 * @status    built
   *
   * @dependencies PermissionMatrixService.review
   *
   * @param dto - the changes
   * @returns `200 { data: { rows, warnings } }`
   */
  @RequirePermission('roles.manage')
  @HttpCode(200)
  @ApiOperation({ summary: 'Preview permission changes (API-PRM-02)' })
  @Post('review')
  async review(@Body() dto: ReviewChangesDto): Promise<unknown> {
    return okResponse(await this.matrix.review(dto.changes));
  }

  /**
   * PUT /roles/permissions.
   *
   * In plain words: saves the changes with a reason.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-014
 * @subtask   ST-ADM01-014-BE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-03
 * @ac        AC-US014-03, AC-US014-04, AC-US014-05
 * @lld       LLD-EPIC-ADM-01 v0.16 §6.6
 * @status    built
   *
   * @dependencies PermissionMatrixService.save
   *
   * @param dto - the save body
   * @param req - the request, for the signed-in user
   * @returns `200 { data: { saved, auditId, matrixVersion } }`
   */
  @RequirePermission('roles.manage')
  @ApiOperation({ summary: 'Save permission changes (API-PRM-03)' })
  @Put()
  async save(@Body() dto: SaveChangesDto, @Req() req: { user: SessionUser }): Promise<unknown> {
    return okResponse(await this.matrix.save(dto, req.user.userId, req.user.employeeCode));
  }
}
