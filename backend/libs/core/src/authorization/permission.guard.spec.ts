/**
 * @file    permission.guard.spec.ts
 * @module  AuthorizationModule
 *
 * @description
 * Unit tests of the permission and company guards (Jest). Written before the code (TDD). Fakes replace the repositories, the cache and the audit service.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/permission.guard.spec.ts
 * @lld-synced     v0.28
 * @status         built
 */

import 'reflect-metadata';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataScope, RoleStatus } from '@libs/database';
import { activeRole, contextFor, DAY, FakeCache, FakeCells, FakeRoles, Routes, sessionUser } from './authorization.fakes';
import { PermissionGuard } from './permission.guard';
import { PermissionResolver } from './permission-resolver.service';
import { Public } from './public.decorator';
import { RequirePermission } from './require-permission.decorator';
import { PUBLIC_ROUTE_KEY, REQUIRE_PERMISSION_KEY } from './session-user.interface';

/**
 * Test cases come from the story's test plan (stories v0.2, AC-US017-01 to 08).
 */
describe('decorators @Public and @RequirePermission', () => {
  class Sample {
    @Public()
    open(): void {}

    @RequirePermission('users.manage')
    protectedRoute(): void {}

    plain(): void {}
  }

  @RequirePermission('roles.view')
  class WholeController {
    route(): void {}
  }

  /**
   * @tc        TC-ADM01-017-J06
   * @story     US-ADM01-017
   * @ac        AC-US017-06
   * @subtask   ST-ADM01-017-BE-01
   * In plain words: a route marked @Public carries the open mark; a route marked @RequirePermission carries its key.
   */
  it('stores the open-route mark and the permission key on a method', () => {
    expect(Reflect.getMetadata(PUBLIC_ROUTE_KEY, Sample.prototype.open)).toBe(true);
    expect(Reflect.getMetadata(REQUIRE_PERMISSION_KEY, Sample.prototype.protectedRoute)).toBe('users.manage');
    expect(Reflect.getMetadata(PUBLIC_ROUTE_KEY, Sample.prototype.plain)).toBeUndefined();
    expect(Reflect.getMetadata(REQUIRE_PERMISSION_KEY, Sample.prototype.plain)).toBeUndefined();
  });

  /**
   * @tc        TC-ADM01-017-J06
   * @story     US-ADM01-017
   * @ac        AC-US017-06
   * @subtask   ST-ADM01-017-BE-01
   * In plain words: the same two decorators work on a whole controller class.
   */
  it('stores the permission key on a controller class', () => {
    expect(Reflect.getMetadata(REQUIRE_PERMISSION_KEY, WholeController)).toBe('roles.view');
  });
});

describe('PermissionGuard', () => {
  let roles: FakeRoles;
  let cells: FakeCells;
  let cache: FakeCache;
  let audit: { recordRefusal: jest.Mock };
  let guard: PermissionGuard;

  beforeEach(() => {
    roles = new FakeRoles();
    cells = new FakeCells();
    cache = new FakeCache();
    audit = { recordRefusal: jest.fn().mockResolvedValue(undefined) };
    const resolver = new PermissionResolver(roles as never, cells as never, cache as never);
    guard = new PermissionGuard(new Reflector(), resolver, audit as never);
  });

  const call = (handler: () => void, request: Record<string, unknown>) => guard.canActivate(contextFor(handler, request));
  const refusal = async (promise: Promise<unknown>): Promise<ForbiddenException> => {
    try {
      await promise;
    } catch (err) {
      return err as ForbiddenException;
    }
    throw new Error('expected a refusal');
  };

  /**
   * @tc        TC-ADM01-017-J01
   * @story     US-ADM01-017
   * @ac        AC-US017-01
   * @subtask   ST-ADM01-017-BE-06
   * In plain words: when a permission is switched off and saved, the user's next call is refused with 403.
   */
  it('refuses the next call after the permission is switched off', async () => {
    roles.rows = [activeRole('r-1')];
    cells.byRole['r-1'] = [{ key: 'users.manage', allowed: true, scope: DataScope.COMPANY }];
    const request = { user: sessionUser } as Record<string, unknown>;
    await expect(call(Routes.prototype.usersRoute, request)).resolves.toBe(true);
    expect(request.dataScope).toBe(DataScope.COMPANY);

    cells.byRole['r-1'] = [{ key: 'users.manage', allowed: false, scope: null }];
    await cache.clearAll(); // what the matrix save does
    const err = await refusal(call(Routes.prototype.usersRoute, { user: sessionUser }));
    expect(err).toBeInstanceOf(ForbiddenException);
    expect(err.getResponse()).toMatchObject({ code: 'FORBIDDEN' });
    expect(audit.recordRefusal).toHaveBeenCalledWith({ userId: 'u-1', companyCode: 'IPL', permissionKey: 'users.manage', code: 'FORBIDDEN' });
  });

  /**
   * @tc        TC-ADM01-017-J02
   * @story     US-ADM01-017
   * @ac        AC-US017-02
   * @subtask   ST-ADM01-017-BE-06
   * In plain words: a user whose role does not hold the right is refused on a users route.
   */
  it('refuses a user without users.manage on a users route', async () => {
    roles.rows = [activeRole('initiator')];
    cells.byRole.initiator = [{ key: 'users.manage', allowed: false, scope: null }];
    const err = await refusal(call(Routes.prototype.usersRoute, { user: sessionUser }));
    expect(err.getStatus()).toBe(403);
    expect(err.getResponse()).toMatchObject({ code: 'FORBIDDEN' });
  });

  /**
   * @tc        TC-ADM01-017-J05
   * @story     US-ADM01-017
   * @ac        AC-US017-05
   * @subtask   ST-ADM01-017-BE-06
   * In plain words: nothing is open by accident; a route with no permission and no open mark is refused.
   */
  it('refuses a route that declares no permission and is not public', async () => {
    roles.rows = [activeRole('admin')];
    const err = await refusal(call(Routes.prototype.undeclaredRoute, { user: sessionUser }));
    expect(err.getResponse()).toMatchObject({ code: 'NO_PERMISSION_DECLARED' });
    expect(audit.recordRefusal).toHaveBeenCalledWith(expect.objectContaining({ code: 'NO_PERMISSION_DECLARED' }));
  });

  /**
   * @tc        TC-ADM01-017-J06
   * @story     US-ADM01-017
   * @ac        AC-US017-06
   * @subtask   ST-ADM01-017-BE-06
   * In plain words: with no signed-in user the answer is 401; a public route needs no session.
   */
  it('answers 401 with no user, and lets a public route through', async () => {
    await expect(call(Routes.prototype.usersRoute, {})).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(call(Routes.prototype.usersRoute, {})).rejects.toMatchObject({ response: { code: 'UNAUTHENTICATED' } });
    await expect(call(Routes.prototype.openRoute, {})).resolves.toBe(true);
  });

  /**
   * @tc        TC-ADM01-017-J07
   * @story     US-ADM01-017
   * @ac        AC-US017-07
   * @subtask   ST-ADM01-017-BE-06
   * In plain words: a role that has ended, or is Inactive, gives no rights.
   */
  it('ignores a role that has ended or is Inactive', async () => {
    const yesterday = new Date(Date.now() - DAY);
    roles.rows = [activeRole('ended', yesterday), { ...activeRole('off'), roleStatus: RoleStatus.INACTIVE }];
    cells.byRole.ended = [{ key: 'users.manage', allowed: true, scope: DataScope.COMPANY }];
    cells.byRole.off = [{ key: 'users.manage', allowed: true, scope: DataScope.COMPANY }];
    const err = await refusal(call(Routes.prototype.usersRoute, { user: sessionUser }));
    expect(err.getResponse()).toMatchObject({ code: 'FORBIDDEN' });
  });

  /**
   * @story   US-ADM01-017
   * @ac      AC-US017-01
   * @subtask ST-ADM01-017-BE-02
   * In plain words: supporting test. When two roles allow the same right, the widest data scope wins.
   */
  it('gives the widest data scope when several roles allow the right', async () => {
    roles.rows = [activeRole('a'), activeRole('b')];
    cells.byRole.a = [{ key: 'users.manage', allowed: true, scope: DataScope.OWN }];
    cells.byRole.b = [{ key: 'users.manage', allowed: true, scope: DataScope.DEPARTMENT }];
    const request = { user: sessionUser } as Record<string, unknown>;
    await expect(call(Routes.prototype.usersRoute, request)).resolves.toBe(true);
    expect(request.dataScope).toBe(DataScope.DEPARTMENT);
  });
});

