/**
 * @file    session-route.spec.ts
 * @module  AuthorizationModule
 *
 * @description
 * Jest cases of the session-route mark (`@SessionRoute`). In plain words: the routes that a signed-in user opens before a company is chosen (`GET /me`, `PUT /me/context`) accept a session token with no company, need no permission, and are not checked against a company; every other route still refuses such a token.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-001
 * @subtask        ST-LGN03-001-BE-01
 * @contract       API-ME-01
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.0 (see section 6.3)
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/core/src/authorization/session-route.spec.ts
 * @lld-synced     v0.3
 * @status         built
 */

import 'reflect-metadata';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionUserFactory } from '../auth/session-user.factory';
import { FakeCache, FakeCells, FakeRoles } from './authorization.fakes';
import { CompanyGuard } from './company.guard';
import { PermissionGuard } from './permission.guard';
import { PermissionResolver } from './permission-resolver.service';
import { SessionRoute } from './session-route.decorator';
import { PUBLIC_ROUTE_KEY, SESSION_ROUTE_KEY } from './session-user.interface';

class Sample {
  @SessionRoute()
  me(): void {}

  plain(): void {}
}

const context = (handler: () => void, request: Record<string, unknown>): ExecutionContext =>
  ({ getHandler: () => handler, getClass: () => Sample, switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

const claims = { sub: 'u-1', emp: '10002', company: '', dept: null, sid: 's-1' };

describe('@SessionRoute (US-LGN03-001)', () => {
  /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. The mark is stored on the route and is not the open-route mark. */
  it('stores the session-route mark and not the open-route mark', () => {
    expect(Reflect.getMetadata(SESSION_ROUTE_KEY, Sample.prototype.me)).toBe(true);
    expect(Reflect.getMetadata(PUBLIC_ROUTE_KEY, Sample.prototype.me)).toBeUndefined();
    expect(Reflect.getMetadata(SESSION_ROUTE_KEY, Sample.prototype.plain)).toBeUndefined();
  });

  describe('JwtAuthGuard', () => {
    const guard = (verified: Record<string, unknown>) =>
      new JwtAuthGuard({ verifyAsync: jest.fn().mockResolvedValue(verified) } as never, new SessionUserFactory(), new Reflector());
    const request = () => ({ headers: { authorization: 'Bearer good' } }) as Record<string, unknown>;

    /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. A session token with no company opens a session route and the request carries the user. */
    it('lets a token with no company open a session route', async () => {
      const req = request();
      await expect(guard(claims).canActivate(context(Sample.prototype.me, req))).resolves.toBe(true);
      expect(req.user).toEqual({ userId: 'u-1', employeeCode: '10002', companyCode: '', departmentId: null, sessionId: 's-1' });
    });

    /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. The same token is refused (401) on any other route. */
    it('refuses a token with no company on any other route', async () => {
      await expect(guard(claims).canActivate(context(Sample.prototype.plain, request()))).rejects.toBeInstanceOf(Error);
      await expect(guard(claims).canActivate(context(Sample.prototype.plain, request()))).rejects.toMatchObject({ status: 401 });
    });

    /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. A user who must change the password is still refused (403) on a session route. */
    it('still refuses a must-change-password token on a session route', async () => {
      await expect(guard({ ...claims, mcp: true }).canActivate(context(Sample.prototype.me, request()))).rejects.toMatchObject({ status: 403 });
    });

    /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. A session route still needs a good token. */
    it('refuses a missing token on a session route', async () => {
      await expect(guard(claims).canActivate(context(Sample.prototype.me, { headers: {} }))).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('PermissionGuard and CompanyGuard', () => {
    const resolver = new PermissionResolver(new FakeRoles() as never, new FakeCells() as never, new FakeCache() as never);
    const audit = { recordRefusal: jest.fn().mockResolvedValue(undefined) };
    const permission = new PermissionGuard(new Reflector(), resolver, audit as never);
    const company = new CompanyGuard(new Reflector(), resolver, audit as never);
    const user = { userId: 'u-1', employeeCode: '10002', companyCode: '', departmentId: null };

    /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. A session route needs no permission, but a user must be signed in. */
    it('lets a signed-in user pass a session route with no permission, and refuses no user', async () => {
      await expect(permission.canActivate(context(Sample.prototype.me, { user }))).resolves.toBe(true);
      await expect(permission.canActivate(context(Sample.prototype.me, {}))).rejects.toBeInstanceOf(UnauthorizedException);
    });

    /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. A route with no permission and no session mark is still refused. */
    it('still refuses a plain route with no permission declared', async () => {
      await expect(permission.canActivate(context(Sample.prototype.plain, { user }))).rejects.toBeInstanceOf(ForbiddenException);
    });

    /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. The company guard does not check a company on a session route. */
    it('does not check the company on a session route', async () => {
      await expect(company.canActivate(context(Sample.prototype.me, { user, query: { companyCode: 'IPLFB' }, headers: {} }))).resolves.toBe(true);
    });
  });
});
