/**
 * @file    password.controller.ts
 * @module  AuthModule
 *
 * @description
 * The password routes. In plain words: thin routes for the reset request, the link check, the new password and the temporary-password change.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-001, US-LGN02-002, US-LGN02-004
 * @subtask        ST-LGN02-001-BE-01
 * @subtask        ST-LGN02-002-BE-01
 * @subtask        ST-LGN02-004-BE-01
 * @contract       API-PWD-01, API-PWD-02, API-PWD-03, API-PWD-04
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/apps/auth-apis/src/controllers/password.controller.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Body, Controller, Get, HttpCode, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { okResponse } from '@libs/common';
import { PasswordResetRequestService, PasswordResetService, TemporaryPasswordChangeService } from '@libs/core';
import { ChangeTemporaryPasswordDto } from '../dtos/change-temporary-password.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { PendingPasswordGuard, PendingRequest } from '../guards/pending-password.guard';
import { setRefreshCookie } from '../utils/session-cookie.util';

/**
 * PasswordController.
 *
 * In plain words: the four password routes of the Auth API (API-PWD-01 to API-PWD-04). Open routes except the temporary-password change, which needs the sign-in token.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-001, US-LGN02-002, US-LGN02-004
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-001-01, AC-US-LGN02-002-01, AC-US-LGN02-004-02
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
@Controller('auth/password')
export class PasswordController {
  constructor(
    private readonly requests: PasswordResetRequestService,
    private readonly resets: PasswordResetService,
    private readonly temporary: TemporaryPasswordChangeService,
  ) {}

  /** API-PWD-01: asks for a reset link; the answer is the same for every pair. */
  @Post('forgot')
  @HttpCode(202)
  async forgot(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    return okResponse(await this.requests.request(dto, req.ip ?? 'unknown'));
  }

  /** API-PWD-02: checks that a link is still valid. */
  @Get('reset/:token')
  async checkLink(@Param('token') token: string) {
    return okResponse(await this.resets.checkLink(token));
  }

  /** API-PWD-03: sets a new password with a link. */
  @Post('reset')
  @HttpCode(200)
  async reset(@Body() dto: ResetPasswordDto) {
    return okResponse(await this.resets.setPassword(dto));
  }

  /** API-PWD-04: changes a temporary password; answers with a new session. */
  @Post('change-temporary')
  @HttpCode(200)
  @UseGuards(PendingPasswordGuard)
  async changeTemporary(@Body() dto: ChangeTemporaryPasswordDto, @Req() req: PendingRequest, @Res({ passthrough: true }) res: Response) {
    const out = await this.temporary.change(dto, req.pending as NonNullable<PendingRequest['pending']>);
    setRefreshCookie(res, out.session.refreshToken, out.session.refreshSeconds);
    return okResponse({ nextStep: out.nextStep, accessToken: out.session.accessToken, expiresIn: out.session.expiresIn });
  }
}
