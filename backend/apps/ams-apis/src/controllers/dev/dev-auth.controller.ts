/**
 * @file    dev-auth.controller.ts
 * @module  AmsApis
 *
 * @description
 * Development sign-in route (TBD-ADM01-02). In plain words: POST /dev/sign-in gives an access token and sets the refresh cookie; GET /dev/whoami shows the session user. Registered only when APP_ENV is dev or test.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-06
 */

import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { okResponse, UnauthenticatedAppException } from '@libs/common';
import { ConfigService } from '@nestjs/config';
import { IsString, Length } from 'class-validator';
import type { Response } from 'express';
import { AuthedRequest, DevSignInService, Public } from '@libs/core';

/** Body of the development sign-in. */
export class DevSignInDto {
  /** Five-digit employee code. */
  @IsString()
  @Length(5, 5)
  employeeCode!: string;

  /** Company to sign in to, for example IPL. */
  @IsString()
  @Length(1, 10)
  companyCode!: string;
}

/**
 * Development auth controller.
 *
 * In plain words: a stand-in so that tests and developers can sign in before the real sign-in epic exists.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Controller('dev')
export class DevAuthController {
  constructor(
    private readonly signInService: DevSignInService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Sign in.
   *
   * In plain words: the access token is in the body; the refresh token is only in an HTTP-only cookie.
   *
   * @param dto Employee code and company
   * @param res The response, used to set the cookie
   * @returns `{ data: { accessToken } }`
   * @dependencies DevSignInService.signIn
   */
  @Public()
  @Post('sign-in')
  async signIn(@Body() dto: DevSignInDto, @Res({ passthrough: true }) res: Response): Promise<unknown> {
    const out = await this.signInService.signIn(dto.employeeCode, dto.companyCode);
    res.cookie('ams_refresh', out.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get<boolean>('auth.cookieSecure') ?? false,
      path: '/api/v1',
      maxAge: out.refreshSeconds * 1000,
    });
    // Marker for the front end's route gating (not a secret, not HTTP-only; the front end never sets it).
    res.cookie('ams_session', '1', { httpOnly: false, sameSite: 'lax', path: '/', maxAge: out.refreshSeconds * 1000 });
    return okResponse({ accessToken: out.accessToken });
  }

  /**
   * Show the session user.
   *
   * In plain words: lets a test check what the token says.
   *
   * @param req The request carrying the session user
   * @returns `{ data: SessionUser }`
   * @dependencies JwtAuthGuard
   */
  @Public()
  @Get('whoami')
  whoami(@Req() req: AuthedRequest): unknown {
    if (!req.user) throw new UnauthenticatedAppException('UNAUTHENTICATED', 'Sign in to continue');
    return okResponse(req.user);
  }
}
