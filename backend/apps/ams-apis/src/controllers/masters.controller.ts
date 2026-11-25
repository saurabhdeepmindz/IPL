/**
 * @file    masters.controller.ts
 * @module  AmsApis
 *
 * @description
 * Masters read routes. In plain words: GET /masters/departments, /masters/designations and /masters/companies for the drop-downs of the user screens (decision L-70).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/controllers/masters.controller.ts
 * @lld-synced     v0.26
 * @status         built
 */

import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { okResponse } from '@libs/common';
import { PermissionResolver, RequirePermission, SessionUser } from '@libs/core';
import { MastersReadService } from '@libs/organisation';

/**
 * Masters controller. In plain words: three thin routes; each needs `users.view`.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-BE-01
 * @frd       FR-042.1, FR-042.2, FR-042.3, FR-042.4, FR-042.6, FR-043.2
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-MST-01, API-MST-02, API-MST-03
 * @ac        AC-US002-02
 * @lld       LLD-EPIC-ADM-01 v0.26 §6.3
 * @status    built
 *
 * @dependencies MastersReadService, PermissionResolver
 *
 * @returns The answers
 */
@Controller('masters')
export class MastersController {
  constructor(
    private readonly masters: MastersReadService,
    private readonly permissions: PermissionResolver,
  ) {}

  @RequirePermission('users.view')
  @ApiOperation({ summary: 'Departments (API-MST-01)' })
  @Get('departments')
  async departments(): Promise<unknown> {
    return okResponse({ items: await this.masters.departments() });
  }

  @RequirePermission('users.view')
  @ApiOperation({ summary: 'Designations (API-MST-02)' })
  @Get('designations')
  async designations(): Promise<unknown> {
    return okResponse({ items: await this.masters.designations() });
  }

  @RequirePermission('users.view')
  @ApiOperation({ summary: 'Companies (API-MST-03)' })
  @Get('companies')
  async companies(@Req() req: { user: SessionUser }): Promise<unknown> {
    const { allowed } = await this.permissions.resolve(req.user, 'companies.view-all');
    return okResponse(await this.masters.companies(allowed));
  }
}
