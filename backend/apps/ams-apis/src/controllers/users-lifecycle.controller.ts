/**
 * @file    users-lifecycle.controller.ts
 * @module  UsersApi
 *
 * @description
 * User life routes: deactivate, unlock, reset password and re-send the one-time password (API-USR-05 to API-USR-08). In plain words: thin; each route names its permission and passes the call to the lifecycle service.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005, US-ADM01-007
 * @subtask        ST-ADM01-005-BE-01, ST-ADM01-007-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/controllers/users-lifecycle.controller.ts
 * @lld-synced     v0.19
 * @status         built
 */

import { Body, Controller, HttpCode, Param, Post, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { okResponse } from '@libs/common';
import { RequirePermission, SessionUser } from '@libs/core';
import { UsersLifecycleService } from '@libs/users';
import { DeactivateUserDto } from '../dtos/users/deactivate-user.dto';

/**
 * Users lifecycle controller.
 *
 * In plain words: turns four calls into service calls and wraps the answers.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005, US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-05 to API-USR-08
 *   lld:       LLD-EPIC-ADM-01 v0.19 section 6.1
 */
@Controller('users')
export class UsersLifecycleController {
  constructor(
    private readonly lifecycle: UsersLifecycleService,
  ) {}

  /**
   * POST /users/:employeeCode/deactivate.
   *
   * In plain words: deactivates a leaver; the user is never deleted.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-005
 * @subtask   ST-ADM01-005-BE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-05
 * @ac        AC-US005-01, AC-US005-02
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.1
 * @status    built
   *
   * @dependencies UsersLifecycleService.deactivate
   *
   * @param employeeCode - the user
   * @param dto - reason, note and the confirmation after the proposals warning
   * @param req - the request (the signed-in Administrator)
   * @returns `{ data: { status: 'INACTIVE' } }`
   */
  @RequirePermission('users.manage')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate a user (API-USR-05)' })
  @Post(':employeeCode/deactivate')
  async deactivate(@Param('employeeCode') employeeCode: string, @Body() dto: DeactivateUserDto, @Req() req: { user: SessionUser }): Promise<unknown> {
    return okResponse(await this.lifecycle.deactivate(employeeCode, dto, req.user.userId));
  }

  /**
   * POST /users/:employeeCode/unlock.
   *
   * In plain words: unlocks a locked user.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-06
 * @ac        AC-US007-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.1
 * @status    built
   *
   * @dependencies UsersLifecycleService.unlock
   *
   * @param employeeCode - the user
   * @param req - the request
   * @returns `200 { data: { status } }`
   */
  @RequirePermission('users.manage')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unlock a user (API-USR-06)' })
  @Post(':employeeCode/unlock')
  async unlock(@Param('employeeCode') employeeCode: string, @Req() req: { user: SessionUser }): Promise<unknown> {
    return okResponse(await this.lifecycle.unlock(employeeCode, req.user.userId));
  }

  /**
   * POST /users/:employeeCode/reset-password.
   *
   * In plain words: resets the password of a local user.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-07
 * @ac        AC-US007-02
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.1
 * @status    built
   *
   * @dependencies UsersLifecycleService.resetPassword
   *
   * @param employeeCode - the user
   * @param req - the request
   * @returns `200 { data: { emailStatus } }`
   */
  @RequirePermission('users.manage')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset a password (API-USR-07)' })
  @Post(':employeeCode/reset-password')
  async resetPassword(@Param('employeeCode') employeeCode: string, @Req() req: { user: SessionUser }): Promise<unknown> {
    return okResponse(await this.lifecycle.resetPassword(employeeCode, req.user.userId));
  }

  /**
   * POST /users/:employeeCode/one-time-password.
   *
   * In plain words: re-sends the one-time password.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-01
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-08
 * @ac        AC-US007-03
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.1
 * @status    built
   *
   * @dependencies UsersLifecycleService.resendOneTimePassword
   *
   * @param employeeCode - the user
   * @param req - the request
   * @returns `200 { data: { emailStatus } }`
   */
  @RequirePermission('users.manage')
  @HttpCode(200)
  @ApiOperation({ summary: 'Re-send the one-time password (API-USR-08)' })
  @Post(':employeeCode/one-time-password')
  async resend(@Param('employeeCode') employeeCode: string, @Req() req: { user: SessionUser }): Promise<unknown> {
    return okResponse(await this.lifecycle.resendOneTimePassword(employeeCode, req.user.userId));
  }
}
