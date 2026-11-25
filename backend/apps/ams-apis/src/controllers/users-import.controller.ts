/**
 * @file    users-import.controller.ts
 * @module  UsersApi
 *
 * @description
 * Import routes (API-USR-09). In plain words: POST /users/import/check says what is wrong with each row and saves nothing; POST /users/import creates the good rows. Both need users.manage; thin, as the other controllers.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/controllers/users-import.controller.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { okResponse } from '@libs/common';
import { RequirePermission, SessionUser } from '@libs/core';
import { UserInput, UsersCommandService } from '@libs/users';
import { ImportRowDto, ImportUsersDto } from '../dtos/users/import-users.dto';

/** One row as the service input (dates become Date). */
const toInput = (r: ImportRowDto): UserInput => ({
  employeeCode: r.employeeCode,
  fullName: r.fullName,
  email: r.email,
  mobile: r.mobile ?? null,
  departmentId: r.departmentId,
  designationId: r.designationId,
  reportingManagerCode: r.reportingManagerCode ?? null,
  signIn: r.signIn,
  companies: r.companies.map((c) => ({ companyCode: c.companyCode, roleIds: c.roleIds, validFrom: new Date(c.validFrom), validTo: c.validTo ? new Date(c.validTo) : null })),
});

/**
 * Users import controller.
 *
 * In plain words: two routes for the import wizard.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-009
 *   workflows: AD-03
 *   frd:       FR-042.2
 *   contracts: API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.30 section 6.2
 */
@Controller('users/import')
export class UsersImportController {
  constructor(private readonly command: UsersCommandService) {}

  /**
   * POST /users/import/check.
   *
   * In plain words: checks every row with the rules of one user and saves nothing.
   *
   * @story     US-ADM01-009
   * @subtask   ST-ADM01-009-IN-03
   * @contract  API-USR-09
   * @ac        AC-US009-03, AC-US009-04
   * @dependencies UsersCommandService.checkRows
   * @param dto - 1 to 200 rows
   * @returns `{ data: { checked, failed: [{ row, field, message }] } }`
   */
  @RequirePermission('users.manage')
  @ApiOperation({ summary: 'Check import rows, nothing is saved (API-USR-09)' })
  @HttpCode(200)
  @Post('check')
  async check(@Body() dto: ImportUsersDto): Promise<unknown> {
    const failed = await this.command.checkRows(dto.rows.map(toInput));
    return okResponse({ checked: dto.rows.length, failed });
  }

  /**
   * POST /users/import.
   *
   * In plain words: creates the good rows, reports the bad ones; with no valid row the answer is 422 BULK_IMPORT_FAILED with the report.
   *
   * @story     US-ADM01-009
   * @subtask   ST-ADM01-009-IN-03
   * @contract  API-USR-09
   * @ac        AC-US009-01, AC-US009-04
   * @dependencies UsersCommandService.bulkCreate
   * @param dto - 1 to 200 rows
   * @param req - the request (the signed-in Administrator)
   * @returns `{ data: { created, failed[] } }`
   */
  @RequirePermission('users.manage')
  @ApiOperation({ summary: 'Import users (API-USR-09)' })
  @Post()
  async import(@Body() dto: ImportUsersDto, @Req() req: { user: SessionUser }): Promise<unknown> {
    return okResponse(await this.command.bulkCreate(dto.rows.map(toInput), req.user.userId, req.user.employeeCode));
  }
}
