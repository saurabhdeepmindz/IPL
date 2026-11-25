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
 * @lld            LLD-EPIC-ADM-01 v0.6 §6.8 (C-07)
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.6.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/controllers/dev-probe.controller.ts
 * @lld-synced     v0.6
 * @status         built
 * @story          US-ADM01-017
 * @subtask        ST-ADM01-017-BE-06
 */
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { IsBoolean, IsString, Length } from 'class-validator';
import { NotFoundAppException, okResponse } from '@libs/common';
import { DataScopeFilter, PermissionCache, Public, RequirePermission, SessionUser } from '@libs/core';
import { DataScope, PrismaService } from '@libs/database';

/** Body of the matrix switch. */
export class ProbeMatrixDto {
  /** Code of the role whose cell is changed. */
  @IsString()
  @Length(1, 30)
  roleCode!: string;

  /** Permission key, for example `users.view`. */
  @IsString()
  @Length(1, 60)
  permissionKey!: string;

  /** The new value of the cell. */
  @IsBoolean()
  allowed!: boolean;
}

/** What a scoped probe request carries after the guards. */
type ProbeRequest = { user: SessionUser; dataScope?: DataScope | null };

/**
 * Test-only probe routes.
 *
 * In plain words: stand-ins for the users, roles and matrix routes of later stories.
 *
 * TBD-ADM01-02: removed when US-ADM01-010 to 014 are built.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.6 section 6.8
 */
@Controller('dev/probe')
export class DevProbeController {
  constructor(
    private readonly scopeFilter: DataScopeFilter,
    private readonly cache: PermissionCache,
    private readonly prisma: PrismaService,
  ) {}

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

  /**
   * Switches one cell of the matrix and clears the cache. In plain words: does what the matrix save (API-PRM-03) will do.
   *
   * @param dto The role, the permission and the new value
   * @returns The cell after the change
   * @dependencies PrismaService.raw, PermissionCache.clearAll
   */
  @RequirePermission('roles.manage')
  @Post('matrix')
  async matrix(@Body() dto: ProbeMatrixDto): Promise<unknown> {
    const role = await this.prisma.raw.role.findUnique({ where: { code: dto.roleCode } });
    const permission = await this.prisma.raw.permission.findUnique({ where: { code: dto.permissionKey } });
    if (!role || !permission) throw new NotFoundAppException('NOT_FOUND', 'Role or permission not found');
    const where = { roleId_permissionId: { roleId: role.id, permissionId: permission.id } };
    await this.prisma.raw.rolePermission.update({ where, data: { allowed: dto.allowed } });
    await this.cache.clearAll();
    return okResponse({ roleCode: dto.roleCode, permissionKey: dto.permissionKey, allowed: dto.allowed });
  }
}
