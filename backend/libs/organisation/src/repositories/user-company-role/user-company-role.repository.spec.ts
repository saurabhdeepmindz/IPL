/**
 * @file    user-company-role.repository.spec.ts
 * @module  OrganisationModule
 *
 * @description
 * Supporting tests of ST-ADM01-000-BE-08 for the roles of a user, written before the code. In plain words: an ended role is not returned, a role of another company is not returned, and a current role is.
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
import { OrganisationModule } from '../../module';
import { UserCompanyRoleRepository } from './contract';

const stamp = Date.now().toString(36).slice(-6);
const codeA = `RA${stamp}`.slice(0, 10);
const codeB = `RB${stamp}`.slice(0, 10);

describe('ST-ADM01-000-BE-08 UserCompanyRoleRepository.listByUser', () => {
  let prisma: PrismaService;
  let repo: UserCompanyRoleRepository;
  let userId: string;
  const roleIds: string[] = [];

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, OrganisationModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(UserCompanyRoleRepository);
    await prisma.raw.company.createMany({ data: [{ code: codeA, name: 'A' }, { code: codeB, name: 'B' }] });
    userId = (await prisma.raw.user.create({ data: { employeeCode: stamp.slice(0, 5), fullName: 'R', email: `r${stamp}@example.invalid` } })).id;
    for (const [i, status] of (['ACTIVE', 'ACTIVE', 'ACTIVE'] as const).entries()) {
      roleIds.push((await prisma.raw.role.create({ data: { code: `R${i}${stamp}`, name: `R${i} ${stamp}`, description: 'r', status } })).id);
    }
    await prisma.raw.userCompanyRole.createMany({
      data: [
        { userId, roleId: roleIds[0], companyCode: codeA, validFrom: new Date('2026-01-01'), validTo: null, assignedBy: '10001' },
        { userId, roleId: roleIds[1], companyCode: codeA, validFrom: new Date('2025-01-01'), validTo: new Date('2026-06-30'), assignedBy: '10001' },
        { userId, roleId: roleIds[2], companyCode: codeB, validFrom: new Date('2026-01-01'), validTo: null, assignedBy: '10001' },
      ],
    });
  });

  afterAll(async () => {
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.user.delete({ where: { id: userId } });
    await prisma.raw.company.deleteMany({ where: { code: { in: [codeA, codeB] } } });
    await prisma.onModuleDestroy();
  });

  it('a role whose end date has passed is not returned', async () => {
    const rows = await repo.listByUser(userId, codeA, new Date('2026-11-25'));
    expect(rows.map((r) => r.roleId)).toEqual([roleIds[0]]);
  });

  it('the same role is returned on a day inside its dates', async () => {
    const rows = await repo.listByUser(userId, codeA, new Date('2026-03-01'));
    expect(rows.map((r) => r.roleId).sort()).toEqual([roleIds[0], roleIds[1]].sort());
  });

  it('a role of another company is not returned', async () => {
    const rows = await repo.listByUser(userId, codeB, new Date('2026-11-25'));
    expect(rows.map((r) => r.roleId)).toEqual([roleIds[2]]);
  });

  it('returns the role code and status for the caller to filter', async () => {
    const [row] = await repo.listByUser(userId, codeA, new Date('2026-11-25'));
    expect(row).toMatchObject({ roleCode: `R0${stamp}`, roleStatus: 'ACTIVE', validTo: null });
  });
});
