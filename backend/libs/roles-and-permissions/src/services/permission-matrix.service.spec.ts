/**
 * @file    permission-matrix.service.spec.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Unit tests of the permission matrix service (Jest). Written before the code (TDD); fakes replace the repositories, the version repository, the cache port and the audit service. In plain words: shows that the matrix is served, previewed and saved by the story's rules.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/services/permission-matrix.service.spec.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { ValidationFailedException } from '@libs/common';
import { LockedCellException } from '../errors/locked-cell.exception';
import { SensitiveConfirmRequiredException } from '../errors/sensitive-confirm-required.exception';
import { StaleMatrixException } from '../errors/stale-matrix.exception';
import { MatrixChangeAnalyzer } from './matrix-change-analyzer';
import { FakeVersions, MatrixCellRepo, MatrixRoleRepo } from './matrix.fakes';
import { PermissionMatrixService } from './permission-matrix.service';

describe('PermissionMatrixService', () => {
  let versions: FakeVersions;
  let cache: { clearAll: jest.Mock };
  let audit: { recordChange: jest.Mock };
  let service: PermissionMatrixService;

  beforeEach(() => {
    const roles = new MatrixRoleRepo();
    const cells = new MatrixCellRepo();
    versions = new FakeVersions();
    cache = { clearAll: jest.fn().mockResolvedValue(undefined) };
    audit = { recordChange: jest.fn().mockResolvedValue('audit-1') };
    const analyzer = new MatrixChangeAnalyzer(roles as never, cells as never);
    service = new PermissionMatrixService(roles as never, cells as never, versions as never, analyzer, cache as never, audit as never);
  });

  const save = (changes: Parameters<PermissionMatrixService['save']>[0]['changes'], extra: object = {}, version = '3') =>
    service.save({ changes, matrixVersion: version, reason: 'policy', ...extra }, 'actor-1', '10001');

  /**
   * @tc        TC-ADM01-014-J01
   * @story     US-ADM01-014
   * @ac        AC-US014-01
   * @subtask   ST-ADM01-014-BE-04
   * In plain words: roles across (not Inactive ones), permissions down by module, each cell with allowed, scope and locked, and the version as text.
   */
  it('serves the matrix grouped by module with locked cells and the version', async () => {
    const m = await service.getMatrix({});
    expect(m.matrixVersion).toBe('3');
    expect(m.roles).toEqual([{ roleId: 'admin', name: 'Administrator', userCount: 1 }, { roleId: 'init', name: 'Initiator', userCount: 2 }]);
    expect(m.groups.map((g) => g.module)).toEqual(['audit', 'roles', 'users']);
    const manage = m.groups.find((g) => g.module === 'users')!.permissions.find((p) => p.key === 'users.manage')!;
    expect(manage).toMatchObject({ label: 'Manage users', hint: 'users.manage' });
    expect(manage.cells.admin).toEqual({ allowed: true, scope: 'COMPANY', locked: true });
    expect(manage.cells.init).toEqual({ allowed: false, scope: null, locked: true });
    expect(m.groups.find((g) => g.module === 'users')!.permissions[0].cells.admin.locked).toBe(false);
    expect((await service.getMatrix({ module: 'audit' })).groups.map((g) => g.module)).toEqual(['audit']);
    expect((await service.getMatrix({ q: 'manage' })).groups.flatMap((g) => g.permissions.map((p) => p.key)).sort()).toEqual(['roles.manage', 'users.manage']);
  });

  /**
   * @tc        TC-ADM01-014-J02
   * @story     US-ADM01-014
   * @ac        AC-US014-02
   * @subtask   ST-ADM01-014-BE-04
   * In plain words: only Own, Department and Company are accepted as a scope; an unknown role or permission is refused with every problem named.
   */
  it('accepts only OWN, DEPARTMENT and COMPANY as a scope', async () => {
    for (const scope of ['OWN', 'DEPARTMENT', 'COMPANY', null] as const) {
      await expect(service.review([{ roleId: 'init', permissionKey: 'users.view', scope }])).resolves.toBeDefined();
    }
    const bad = service.review([{ roleId: 'init', permissionKey: 'users.view', scope: 'WORLD' as never }, { roleId: 'nobody', permissionKey: 'nope.key' }]);
    await expect(bad).rejects.toBeInstanceOf(ValidationFailedException);
    await expect(bad).rejects.toMatchObject({ fields: expect.arrayContaining([{ field: 'changes.0.scope', message: expect.any(String) }, { field: 'changes.1.roleId', message: expect.any(String) }, { field: 'changes.1.permissionKey', message: expect.any(String) }]) });
  });

  /**
   * @tc        TC-ADM01-014-J03
   * @story     US-ADM01-014
   * @ac        AC-US014-03
   * @subtask   ST-ADM01-014-BE-04
   * In plain words: review shows before, after and users affected and saves nothing; save keeps the reason and approval reference, clears the cache once and answers saved, auditId and the new version.
   */
  it('reviews without saving, and saves with a reason and an approval reference', async () => {
    const change = [{ roleId: 'init', permissionKey: 'users.view', scope: 'COMPANY' as const }];
    const { rows } = await service.review(change);
    expect(rows).toEqual([expect.objectContaining({ roleName: 'Initiator', permissionKey: 'users.view', before: { allowed: true, scope: 'OWN' }, after: { allowed: true, scope: 'COMPANY' }, usersAffected: 2, sensitive: false })]);
    expect(versions.commits).toEqual([]);
    expect(audit.recordChange).not.toHaveBeenCalled();

    const done = await save(change, { approvalReference: 'APR-7' });
    expect(done).toEqual({ saved: 1, auditId: 'audit-1', matrixVersion: '4' });
    expect(versions.commits[0]).toMatchObject({ expected: 3, savedBy: '10001', reason: 'policy', writes: [{ roleId: 'init', permissionKey: 'users.view', allowed: true, scope: 'COMPANY' }] });
    expect(cache.clearAll).toHaveBeenCalledTimes(1);
    expect(audit.recordChange).toHaveBeenCalledTimes(1);
    expect(audit.recordChange).toHaveBeenCalledWith(expect.objectContaining({ actor: 'actor-1', entity: 'PermissionMatrix', entityKey: '4', reason: 'policy', after: expect.objectContaining({ approvalReference: 'APR-7' }) }));
  });

  /**
   * @story   US-ADM01-014
   * @ac      AC-US014-03
   * @subtask ST-ADM01-014-BE-04
   * In plain words: supporting test (decision L-25). A save in which nothing changes answers saved 0, keeps the version, clears nothing and writes no audit record.
   */
  it('saves nothing when no cell changes', async () => {
    const done = await save([{ roleId: 'init', permissionKey: 'users.view', allowed: true, scope: 'OWN' }]);
    expect(done).toEqual({ saved: 0, auditId: null, matrixVersion: '3' });
    expect(versions.commits).toEqual([]);
    expect(cache.clearAll).not.toHaveBeenCalled();
    expect(audit.recordChange).not.toHaveBeenCalled();
  });

  /**
   * @tc        TC-ADM01-014-J04
   * @story     US-ADM01-014
   * @ac        AC-US014-04
   * @subtask   ST-ADM01-014-BE-04
   * In plain words: a sensitive right for a role other than Administrator needs confirmation; an old version gives STALE_MATRIX.
   */
  it('asks for confirmation of a sensitive right and refuses a stale version', async () => {
    const sensitive = [{ roleId: 'init', permissionKey: 'audit.view', allowed: true, scope: 'COMPANY' as const }];
    await expect(save(sensitive)).rejects.toBeInstanceOf(SensitiveConfirmRequiredException);
    await expect(save(sensitive, { confirmSensitive: false })).rejects.toBeInstanceOf(SensitiveConfirmRequiredException);
    expect(versions.commits).toEqual([]);
    expect((await service.review(sensitive)).warnings).toHaveLength(1);
    await expect(save(sensitive, { confirmSensitive: true })).resolves.toMatchObject({ saved: 1 });
    await expect(save([{ roleId: 'init', permissionKey: 'users.view', scope: 'DEPARTMENT' }], {}, '3')).rejects.toBeInstanceOf(StaleMatrixException);
  });

  /**
   * @tc        TC-ADM01-014-J05
   * @story     US-ADM01-014
   * @ac        AC-US014-05
   * @subtask   ST-ADM01-014-BE-04
   * In plain words: a locked cell of the Administrator role, or an administration right for another role, gives LOCKED_CELL.
   */
  it('refuses locked cells', async () => {
    await expect(save([{ roleId: 'admin', permissionKey: 'users.manage', allowed: false }])).rejects.toBeInstanceOf(LockedCellException);
    await expect(save([{ roleId: 'admin', permissionKey: 'roles.manage', allowed: false }])).rejects.toMatchObject({ code: 'LOCKED_CELL' });
    await expect(save([{ roleId: 'init', permissionKey: 'users.manage', allowed: true }])).rejects.toBeInstanceOf(LockedCellException);
    await expect(service.review([{ roleId: 'init', permissionKey: 'roles.manage', allowed: true }])).rejects.toBeInstanceOf(LockedCellException);
    await expect(save([{ roleId: 'admin', permissionKey: 'users.view', allowed: false }])).resolves.toMatchObject({ saved: 1 });
    expect(versions.commits).toHaveLength(1);
  });
});
