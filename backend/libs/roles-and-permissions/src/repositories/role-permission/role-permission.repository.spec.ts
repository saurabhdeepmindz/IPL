/**
 * @file    role-permission.repository.spec.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Supporting test of ST-ADM01-000-BE-08 for the cells of a role, written before the code. In plain words: the cells of a role come back with key, flag and scope.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-08
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
