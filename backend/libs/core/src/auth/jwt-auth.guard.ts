/**
 * @file    jwt-auth.guard.ts
 * @module  CoreModule
 *
 * @description
 * Reads the access token and puts the session user on the request. In plain words: a request with no token or a bad token gets 401; a good one carries the user and its company through the rest of the request.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-06
 */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ForbiddenAppException, UnauthenticatedAppException } from '@libs/common';
import { CompanyContext } from '@libs/database';
import { SessionUserFactory } from './session-user.factory';
import { AccessClaims } from './session-user.shape';
import { PUBLIC_ROUTE_KEY, SESSION_ROUTE_KEY, SessionUser } from '../authorization/session-user.interface';

/** A request that carries the session user. */
export type AuthedRequest = Request & { user?: SessionUser };

/**
 * JWT authentication guard.
 *
 * In plain words: checks the "Authorization: Bearer ..." header.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly factory: SessionUserFactory,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Decide whether the request may go on.
   *
   * In plain words: verifies the token, sets request.user and the session company. A token with no company (the session before a company is chosen) is accepted only on a route marked `@SessionRoute`. An open route (`@Public`) is let through with no token; if a good token is sent, the user is still set.
   *
   * @param context The request context
   * @returns true when the token is good
   * @throws UnauthenticatedAppException (401) when the token is missing or not valid
   * @dependencies JwtService.verifyAsync, SessionUserFactory.fromClaims, CompanyContext.enter
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const targets = [context.getHandler(), context.getClass()];
    const open = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, targets) === true;
    const sessionRoute = this.reflector.getAllAndOverride<boolean>(SESSION_ROUTE_KEY, targets) === true;
    if (!token) {
      if (open) return true;
      throw new UnauthenticatedAppException('UNAUTHENTICATED', 'Sign in to continue');
    }
    try {
      const claims = await this.jwt.verifyAsync<AccessClaims>(token);
      if (claims.mcp) throw new ForbiddenAppException('MUST_CHANGE_PASSWORD', 'Change your temporary password first');
      if (!claims.company && !sessionRoute) throw new Error('not an access token');
      req.user = this.factory.fromClaims(claims);
      if (req.user.companyCode) CompanyContext.enter(req.user.companyCode);
      return true;
    } catch (e) {
      if (e instanceof ForbiddenAppException) throw e;
      if (open) return true;
      throw new UnauthenticatedAppException('UNAUTHENTICATED', 'Your session is not valid. Sign in again');
    }
  }
}
