/**
 * @file    company.guard.spec.ts
 * @module  AuthorizationModule
 *
 * @description
 * Unit tests of the company guard (Jest). Written before the code (TDD).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.7 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.7.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/company.guard.spec.ts
 * @lld-synced     v0.7
 * @status         built
 */

import 'reflect-metadata';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CompanyGuard } from './company.guard';
import { PermissionResolver } from './permission-resolver.service';
import { activeRole, contextFor, FakeCache, FakeCells, FakeRoles, Routes, sessionUser } from './authorization.fakes';

describe('CompanyGuard', () => {
  let roles: FakeRoles;
  let cells: FakeCells;
  let audit: { recordRefusal: jest.Mock };
  let guard: CompanyGuard;

  beforeEach(() => {
    roles = new FakeRoles();
    cells = new FakeCells();
    audit = { recordRefusal: jest.fn().mockResolvedValue(undefined) };
    const resolver = new PermissionResolver(roles as never, cells as never, new FakeCache() as never);
    guard = new CompanyGuard(new Reflector(), resolver, audit as never);
  });

  const request = (query: Record<string, string>, headers: Record<string, string> = {}): Record<string, unknown> => ({
    user: sessionUser,
    query,
    headers,
  });

  /**
   * @tc        TC-ADM01-017-J03
   * @story     US-ADM01-017
   * @ac        AC-US017-03
   * @subtask   ST-ADM01-017-BE-03
   * In plain words: a call that names another company is refused with COMPANY_MISMATCH and the refusal is logged.
   */
  it('refuses a call that names another company', async () => {
    try {
      await guard.canActivate(contextFor(Routes.prototype.usersRoute, request({ companyCode: 'IPLFB' })));
      throw new Error('expected a refusal');
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenException);
      expect((err as ForbiddenException).getResponse()).toMatchObject({ code: 'COMPANY_MISMATCH' });
    }
    expect(audit.recordRefusal).toHaveBeenCalledWith(expect.objectContaining({ code: 'COMPANY_MISMATCH', companyCode: 'IPL' }));
  });

  /**
   * @tc        TC-ADM01-017-J03
   * @story     US-ADM01-017
   * @ac        AC-US017-03
   * @subtask   ST-ADM01-017-BE-03
   * In plain words: no company named, the session company named (query or header), or an open route all pass.
   */
  it('lets a call pass when it names no company or the session company', async () => {
    const pass = (req: Record<string, unknown>, handler = Routes.prototype.usersRoute) => guard.canActivate(contextFor(handler, req));
    await expect(pass(request({}))).resolves.toBe(true);
    await expect(pass(request({ companyCode: 'IPL' }))).resolves.toBe(true);
    await expect(pass(request({}, { 'x-company-code': 'IPL' }))).resolves.toBe(true);
    await expect(pass(request({ companyCode: 'IPLFB' }), Routes.prototype.openRoute)).resolves.toBe(true);
  });

  /**
   * @tc        TC-ADM01-017-J04
   * @story     US-ADM01-017
   * @ac        AC-US017-04
   * @subtask   ST-ADM01-017-BE-03
   * In plain words: ALL companies is allowed only for a user who holds companies.view-all, and the call is marked.
   */
  it('allows ALL companies only with companies.view-all', async () => {
    roles.rows = [activeRole('auditor')];
    cells.byRole.auditor = [{ key: 'companies.view-all', allowed: false, scope: null }];
    await expect(guard.canActivate(contextFor(Routes.prototype.usersRoute, request({ companyCode: 'ALL' })))).rejects.toMatchObject({
      response: { code: 'COMPANY_MISMATCH' },
    });

    cells.byRole.auditor = [{ key: 'companies.view-all', allowed: true, scope: null }];
    const withRight = new CompanyGuard(
      new Reflector(),
      new PermissionResolver(roles as never, cells as never, new FakeCache() as never),
      audit as never,
    );
    const req = request({ companyCode: 'ALL' });
    await expect(withRight.canActivate(contextFor(Routes.prototype.usersRoute, req))).resolves.toBe(true);
    expect(req.allCompanies).toBe(true);
  });
});
