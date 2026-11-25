/**
 * @file    role-permission.repository.spec.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Supporting tests of the cells of a role, written before the code (ST-ADM01-000-BE-08: reading; ST-ADM01-010-BE-04: replace and copy). In plain words: the cells of a role come back with key, flag and scope, and can be replaced and copied.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic           EPIC-ADM-01
 * @story          US-ADM01-017, US-ADM01-010
 * @subtask        ST-ADM01-000-BE-08, ST-ADM01-010-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/role-permission/role-permission.repository.spec.ts
 * @lld-synced     v0.28
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { RolesAndPermissionsModule } from '../../module';
import { RolePermissionRepository } from './contract';

const stamp = Date.now().toString(36).slice(-6);

describe('ST-ADM01-000-BE-08 RolePermissionRepository.listForRole', () => {
  let prisma: PrismaService;
  let repo: RolePermissionRepository;
  let roleId: string;
  const permIds: string[] = [];

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, RolesAndPermissionsModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(RolePermissionRepository);
    roleId = (await prisma.raw.role.create({ data: { code: `P${stamp}`, name: `P ${stamp}`, description: 'p' } })).id;
    for (const code of [`t${stamp}.view`, `t${stamp}.manage`]) {
      permIds.push((await prisma.raw.permission.create({ data: { code, area: 't', description: code } })).id);
    }
    await prisma.raw.rolePermission.createMany({
      data: [
        { roleId, permissionId: permIds[0], allowed: true, scope: 'COMPANY' },
        { roleId, permissionId: permIds[1], allowed: false, scope: null },
      ],
    });
  });

  afterAll(async () => {
    await prisma.raw.rolePermission.deleteMany({ where: { roleId } });
    await prisma.raw.permission.deleteMany({ where: { id: { in: permIds } } });
    await prisma.raw.role.delete({ where: { id: roleId } });
    await prisma.onModuleDestroy();
  });

  it('the cells of a role come back with the key, the flag and the scope', async () => {
    const cells = await repo.listForRole(roleId);
    expect(cells.sort((a, b) => a.key.localeCompare(b.key))).toEqual([
      { key: `t${stamp}.manage`, allowed: false, scope: null },
      { key: `t${stamp}.view`, allowed: true, scope: 'COMPANY' },
    ]);
  });

  it('a role with no cells returns an empty list', async () => {
    expect(await repo.listForRole('00000000-0000-4000-8000-000000000000')).toEqual([]);
  });
});

describe('ST-ADM01-010-BE-04 RolePermissionRepository.replaceForRole and copyFrom', () => {
  let prisma: PrismaService;
  let repo: RolePermissionRepository;
  const roleIds: string[] = [];
  const permIds: string[] = [];
  const keys = [`w${stamp}.view`, `w${stamp}.manage`];

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, RolesAndPermissionsModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(RolePermissionRepository);
    for (const code of keys) permIds.push((await prisma.raw.permission.create({ data: { code, area: 'w', description: code } })).id);
    for (const n of [1, 2]) roleIds.push((await prisma.raw.role.create({ data: { code: `W${n}${stamp}`, name: `W${n} ${stamp}`, description: 'w' } })).id);
  });

  afterAll(async () => {
    await prisma.raw.rolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.permission.deleteMany({ where: { id: { in: permIds } } });
    await prisma.onModuleDestroy();
  });

  const mine = async (roleId: string) => (await repo.listForRole(roleId)).filter((c) => keys.includes(c.key)).sort((a, b) => a.key.localeCompare(b.key));

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-02
   * @subtask ST-ADM01-010-BE-04
   * In plain words: supporting test. Replace writes the given cells and sets every other cell to not allowed.
   */
  it('replaceForRole sets the given cells and clears the others', async () => {
    await repo.replaceForRole(roleIds[0], [{ key: keys[0], allowed: true, scope: 'OWN' }, { key: keys[1], allowed: true, scope: null }]);
    await repo.replaceForRole(roleIds[0], [{ key: keys[0], allowed: true, scope: 'COMPANY' }]);
    expect(await mine(roleIds[0])).toEqual([
      { key: keys[1], allowed: false, scope: null },
      { key: keys[0], allowed: true, scope: 'COMPANY' },
    ]);
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-04
   * @subtask ST-ADM01-010-BE-04
   * In plain words: supporting test. An unknown permission key is refused and nothing is written.
   */
  it('replaceForRole refuses an unknown permission key', async () => {
    await expect(repo.replaceForRole(roleIds[1], [{ key: `nope.${stamp}`, allowed: true, scope: null }])).rejects.toBeDefined();
    expect(await mine(roleIds[1])).toEqual([]);
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-02
   * @subtask ST-ADM01-010-BE-04
   * In plain words: supporting test. Copy gives the target role the same cells as the source.
   */
  it('copyFrom gives the target the cells of the source', async () => {
    await repo.copyFrom(roleIds[0], roleIds[1]);
    expect(await mine(roleIds[1])).toEqual(await mine(roleIds[0]));
  });
});

describe('ST-ADM01-014-BE-03 RolePermissionRepository.readMatrix', () => {
  let prisma: PrismaService;
  let repo: RolePermissionRepository;
  let roleId: string;
  let permId: string;

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, RolesAndPermissionsModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(RolePermissionRepository);
    roleId = (await prisma.raw.role.create({ data: { code: `M${stamp}`, name: `M ${stamp}`, description: 'm' } })).id;
    permId = (await prisma.raw.permission.create({ data: { code: `m${stamp}.view`, area: `mx${stamp}`, description: `Label ${stamp}` } })).id;
    await prisma.raw.rolePermission.create({ data: { roleId, permissionId: permId, allowed: true, scope: 'OWN' } });
  });

  afterAll(async () => {
    await prisma.raw.rolePermission.deleteMany({ where: { roleId } });
    await prisma.raw.role.delete({ where: { id: roleId } });
    await prisma.raw.permission.delete({ where: { id: permId } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-014
   * @ac      AC-US014-01
   * @subtask ST-ADM01-014-BE-03
   * In plain words: supporting test. The whole-matrix read returns every permission with its module and label, and every cell of every role.
   */
  it('readMatrix returns the permissions with module and label, and the cells', async () => {
    const data = await repo.readMatrix();
    expect(data.permissions).toContainEqual({ key: `m${stamp}.view`, module: `mx${stamp}`, label: `Label ${stamp}` });
    expect(data.cells).toContainEqual({ roleId, key: `m${stamp}.view`, allowed: true, scope: 'OWN' });
    expect(data.permissions.length).toBeGreaterThanOrEqual(6);
  });
});
