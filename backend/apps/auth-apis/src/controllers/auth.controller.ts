/**
 * @file    auth.controller.ts
 * @module  AuthModule
 *
 * @description
 * The sign-in routes. In plain words: thin routes for the password sign-in, the single sign-on start and callback, the token renewal and the public settings.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001, US-LGN01-002, US-LGN01-003, US-LGN01-004
 * @subtask        ST-LGN01-001-BE-01
 * @subtask        ST-LGN01-002-BE-01
 * @subtask        ST-LGN01-003-BE-01
 * @subtask        ST-LGN01-004-BE-01
 * @contract       API-AUTH-01, API-AUTH-02, API-AUTH-03, API-AUTH-04, API-AUTH-05
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/apps/auth-apis/src/controllers/auth.controller.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Body, Controller, Get, HttpCode, Post, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { okResponse } from '@libs/common';
import { IdentityProviderUnavailableException, LocalSignInService, NextStep, SessionService, SsoSignInService } from '@libs/core';
import { SettingsService } from '@libs/settings';
import { SignInDto } from '../dtos/sign-in/sign-in.dto';
import { PublicConfigTransformer } from '../transformer/public-config.transformer';
import { SignInResponseTransformer } from '../transformer/sign-in-response.transformer';
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from '../utils/session-cookie.util';

const STEP_PATH: Record<NextStep, string> = { CHANGE_PASSWORD: '/set-password', CHOOSE_WORK: '/choose-work' };

/**
 * AuthController.
 *
 * In plain words: the sign-in family of routes under `/api/v1/auth`; each route calls one service (API-AUTH-01 to API-AUTH-05).
 *
 * @rtm
 *   epics:     EPIC-LGN-01
 *   stories:   US-LGN01-001, US-LGN01-002, US-LGN01-003, US-LGN01-004
 *   contracts: API-AUTH-01, API-AUTH-02, API-AUTH-03, API-AUTH-04, API-AUTH-05
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly localSignIn: LocalSignInService,
    private readonly sso: SsoSignInService,
    private readonly sessions: SessionService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService,
    private readonly signInBody: SignInResponseTransformer,
    private readonly publicBody: PublicConfigTransformer,
  ) {}

  /** API-AUTH-01: signs in with employee code and password. @story US-LGN01-001 */
  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body() dto: SignInDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.localSignIn.signIn(dto, req.ip ?? 'unknown');
    setRefreshCookie(res, result.refreshToken, result.refreshSeconds);
    return okResponse(this.signInBody.toBody(result));
  }

  /** API-AUTH-02: starts the single sign-on round trip. @story US-LGN01-002 */
  @Get('sso/start')
  async ssoStart(@Query('returnTo') returnTo: string | undefined, @Res() res: Response): Promise<void> {
    try {
      res.redirect(await this.sso.start(returnTo));
    } catch (e) {
      if (e instanceof IdentityProviderUnavailableException) return res.redirect(this.web('/signing-in?state=failed'));
      throw e;
    }
  }

  /** API-AUTH-03: finishes the round trip and starts the session. @story US-LGN01-002 */
  @Get('sso/callback')
  async ssoCallback(@Query() query: Record<string, string>, @Res() res: Response): Promise<void> {
    const result = await this.sso.complete(query);
    if (!result.ok) return res.redirect(this.web(`/signing-in?state=${result.kind}&ref=${encodeURIComponent(result.reference)}${result.who ? `&who=${encodeURIComponent(result.who)}` : ''}`));
    setRefreshCookie(res, result.refreshToken, result.refreshSeconds);
    const next = result.returnTo ? `${STEP_PATH[result.nextStep]}?next=${encodeURIComponent(result.returnTo)}` : STEP_PATH[result.nextStep];
    res.redirect(this.web(next));
  }

  /** API-AUTH-04: renews the access token; the refresh token rotates. @story US-LGN01-003 */
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const renewed = await this.sessions.renew(readRefreshCookie(req));
      setRefreshCookie(res, renewed.refreshToken, 8 * 60 * 60);
      return okResponse({ accessToken: renewed.accessToken, expiresIn: renewed.expiresIn });
    } catch (e) {
      clearRefreshCookie(res);
      throw e;
    }
  }

  /** API-AUTH-05: the settings the sign-in page needs before sign-in. @story US-LGN01-004 */
  @Get('public-config')
  publicConfig() {
    const appEnv = this.config.get<string>('APP_ENV') ?? 'dev';
    const production = appEnv === 'prod';
    const idpMode = this.config.get<string>('IDP_MODE') ?? (production ? undefined : 'stub');
    return okResponse(this.publicBody.toBody(this.settings, idpMode, production));
  }

  /** Builds an address on the web app (the Auth API redirects the browser there). */
  private web(path: string): string {
    return (this.config.get<string>('WEB_BASE_URL') ?? 'http://localhost:3001') + path;
  }
}
