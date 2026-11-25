/**
 * @file    permission-matrix-version.repository.spec.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Supporting tests of the matrix version repository (Jest, real PostgreSQL). Written before the code (TDD). They have no test-case ID of their own (decision ST-02); they carry AC-US014-03 and AC-US014-04. In plain words: shows that a save writes the cells and the next version together, and that a stale or racing save writes nothing.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.17 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.17.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/permission-matrix-version/permission-matrix-version.repository.spec.ts
 * @lld-synced     v0.17
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { StaleMatrixException } from '../../errors/stale-matrix.exception';
import { RolesAndPermissionsModule } from '../../module';
import { PermissionMatrixVersionRepository } from './contract';

const stamp = Date.now().toString(36).slice(-6);

describe('PermissionMatrixVersionRepository (supporting tests, ST-ADM01-014-BE-03)', () => {
  let prisma: PrismaService;
  let repo: PermissionMatrixVersionRepository;
  let roleId: string;
  let permId: string;
  const key = `v${stamp}.view`;
  const cell = async () => prisma.raw.rolePermission.findUniqueOrThrow({ where: { roleId_permissionId: { roleId, permissionId: permId } } });
  const write = (allowed: boolean) => [{ roleId, permissionKey: key, allowed, scope: allowed ? ('COMPANY' as const) : null }];

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, RolesAndPermissionsModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(PermissionMatrixVersionRepository);
    roleId = (await prisma.raw.role.create({ data: { code: `V${stamp}`, name: `V ${stamp}`, description: 'v' } })).id;
    permId = (await prisma.raw.permission.create({ data: { code: key, area: 'v', description: key } })).id;
    await prisma.raw.rolePermission.create({ data: { roleId, permissionId: permId, allowed: false } });
  });

  afterAll(async () => {
    await prisma.raw.permissionMatrixVersion.deleteMany({ where: { reason: { startsWith: `t${stamp}` } } });
    await prisma.raw.rolePermission.deleteMany({ where: { roleId } });
    await prisma.raw.role.delete({ where: { id: roleId } });
    await prisma.raw.permission.delete({ where: { id: permId } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-014
   * @ac      AC-US014-03
   * @subtask ST-ADM01-014-BE-03
   * In plain words: a commit writes the cell and the next version together, and the version becomes the current one.
   */
  it('commits the cells and the next version in one step', async () => {
    const base = await repo.current();
    const next = await repo.commit(base, write(true), '10001', `t${stamp} first`);
    expect(next).toBe(base + 1);
    expect(await repo.current()).toBe(base + 1);
    expect(await cell()).toMatchObject({ allowed: true, scope: 'COMPANY' });
    expect(await prisma.raw.permissionMatrixVersion.findUnique({ where: { version: next } })).toMatchObject({ savedBy: '10001', reason: `t${stamp} first` });
  });

  /**
   * @story   US-ADM01-014
   * @ac      AC-US014-04
   * @subtask ST-ADM01-014-BE-03
   * In plain words: a commit made on an old version is refused and writes nothing.
   */
  it('refuses a stale version and writes nothing', async () => {
    const now = await repo.current();
    await expect(repo.commit(now - 1, write(false), '10001', `t${stamp} stale`)).rejects.toBeInstanceOf(StaleMatrixException);
    expect(await repo.current()).toBe(now);
    expect(await cell()).toMatchObject({ allowed: true });
  });

  /**
   * @story   US-ADM01-014
   * @ac      AC-US014-04
   * @subtask ST-ADM01-014-BE-03
   * In plain words: two commits made at the same moment on the same version: one wins and the other gets STALE_MATRIX.
   */
  it('lets only one of two racing commits win', async () => {
    const base = await repo.current();
    const results = await Promise.allSettled([repo.commit(base, write(false), '10001', `t${stamp} race a`), repo.commit(base, write(true), '10001', `t${stamp} race b`)]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const lost = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
    expect(lost.reason).toBeInstanceOf(StaleMatrixException);
    expect(await repo.current()).toBe(base + 1);
  });

  /**
   * @story   US-ADM01-014
   * @ac      AC-US014-03
   * @subtask ST-ADM01-014-BE-03
   * In plain words: a write that names an unknown permission stops the whole commit; no version is added.
   */
  it('writes no version when a cell cannot be written', async () => {
    const base = await repo.current();
    await expect(repo.commit(base, [{ roleId, permissionKey: `nope.${stamp}`, allowed: true, scope: null }], '10001', `t${stamp} bad`)).rejects.toBeDefined();
    expect(await repo.current()).toBe(base);
  });
});
