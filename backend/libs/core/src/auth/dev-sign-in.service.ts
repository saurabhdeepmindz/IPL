/**
 * @file    dev-sign-in.service.ts
 * @module  CoreModule
 *
 * @description
 * Development and test stand-in for sign-in (TBD-ADM01-02). In plain words: lets a seeded user get a token without the real sign-in epic. It is only wired in dev and test, and must be removed when the sign-in epic is built.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-06
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthenticatedAppException } from '@libs/common';
import { PrismaService } from '@libs/database';
import { UserCompanyRoleRepository } from '@libs/organisation';
import { AccessClaims } from './session-user.shape';

/**
 * Development sign-in service.
 *
 * In plain words: asks "is this an active user with a role in this company today?"; if yes, makes an access token and a refresh token.
 *
 * TBD-ADM01-02: replaced by the real sign-in epic. Remove before the first UAT build.
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
export class DevSignInService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRoles: UserCompanyRoleRepository,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Sign in a user.
   *
   * In plain words: returns the access token (for the response body) and the refresh token (for the cookie only).
   *
   * @param employeeCode Five-digit code of the user
   * @param companyCode Company to sign in to
   * @returns The access token, the refresh token and the refresh life in seconds
   * @throws UnauthenticatedAppException (401) for an unknown or inactive user, or a user with no valid role in that company
   * @dependencies PrismaService.raw, UserCompanyRoleRepository.listByUser, JwtService.signAsync
   */
  async signIn(employeeCode: string, companyCode: string): Promise<{ accessToken: string; refreshToken: string; refreshSeconds: number }> {
    const user = await this.prisma.raw.user.findUnique({ where: { employeeCode } });
    const fail = new UnauthenticatedAppException('UNAUTHENTICATED', 'Employee code or company is not valid');
    if (!user || user.status !== 'ACTIVE') throw fail;
    const roles = await this.userRoles.listByUser(user.id, companyCode, new Date());
    if (!roles.some((r) => r.roleStatus === 'ACTIVE')) throw fail;
    const claims: AccessClaims = { sub: user.id, emp: user.employeeCode, company: companyCode, dept: user.departmentId };
    const accessToken = await this.jwt.signAsync(claims, { expiresIn: '15m' });
    const refreshSeconds = 8 * 60 * 60;
    const refreshToken = await this.jwt.signAsync({ sub: user.id, typ: 'refresh' }, { expiresIn: refreshSeconds });
    return { accessToken, refreshToken, refreshSeconds };
  }
}
