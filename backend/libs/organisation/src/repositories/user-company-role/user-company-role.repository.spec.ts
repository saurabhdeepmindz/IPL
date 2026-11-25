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

describe('ST-ADM01-011-BE-04 UserCompanyRoleRepository.listByRole, findHolders and insertMany', () => {
  let prisma: PrismaService;
  let repo: UserCompanyRoleRepository;
  let roleId: string;
  let deptId: string;
  const userIds: string[] = [];
  const today = new Date('2026-11-25');
  const rowFor = (userId: string, companyCode: string, validFrom = '2026-01-01') => ({ userId, roleId, companyCode, validFrom: new Date(validFrom), assignedBy: '10001' });

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, OrganisationModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(UserCompanyRoleRepository);
    for (const code of ['IPL', 'IPLFB']) await prisma.raw.company.upsert({ where: { code }, update: {}, create: { code, name: code } });
    deptId = (await prisma.raw.department.create({ data: { code: `D${stamp}`, name: `Dept ${stamp}` } })).id;
    roleId = (await prisma.raw.role.create({ data: { code: `H${stamp}`, name: `H ${stamp}`, description: 'h', status: 'ACTIVE' } })).id;
    for (const n of [1, 2, 3]) {
      userIds.push((await prisma.raw.user.create({ data: { employeeCode: `${stamp.slice(0, 3)}U${n}`, fullName: `Holder ${n}`, email: `h${n}${stamp}@example.invalid`, departmentId: n === 1 ? deptId : null } })).id);
    }
    await prisma.raw.userCompanyRole.createMany({
      data: [rowFor(userIds[0], 'IPL'), rowFor(userIds[0], 'IPLFB'), { ...rowFor(userIds[1], 'IPL', '2025-01-01'), validTo: new Date('2026-06-30') }],
    });
  });

  afterAll(async () => {
    await prisma.raw.userCompanyRole.deleteMany({ where: { roleId } });
    await prisma.raw.role.delete({ where: { id: roleId } });
    await prisma.raw.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.raw.department.delete({ where: { id: deptId } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-011
   * @ac      AC-US011-02
   * @subtask ST-ADM01-011-BE-04
   * In plain words: supporting test. The holders of a role show name, department, company and the day they got it; an ended assignment is hidden.
   */
  it('lists the holders of a role in one company', async () => {
    const rows = await repo.listByRole(roleId, 'IPL', today);
    expect(rows).toEqual([expect.objectContaining({ employeeCode: `${stamp.slice(0, 3)}U1`, fullName: 'Holder 1', departmentName: `Dept ${stamp}`, companyCode: 'IPL' })]);
    expect(rows[0].assignedOn).toBeInstanceOf(Date);
  });

  /**
   * @story   US-ADM01-011
   * @ac      AC-US011-02
   * @subtask ST-ADM01-011-BE-04
   * In plain words: supporting test. With no company the holders of every company are listed, one row per user and company.
   */
  it('lists the holders of every company when no company is given', async () => {
    const rows = await repo.listByRole(roleId, null, today);
    expect(rows.map((r) => r.companyCode).sort()).toEqual(['IPL', 'IPLFB']);
  });

  /**
   * @story   US-ADM01-011
   * @ac      AC-US011-01
   * @subtask ST-ADM01-011-BE-04
   * In plain words: supporting test. findHolders names who already holds the role on the day; an assignment that has ended does not count.
   */
  it('finds who already holds the role in the company on a day', async () => {
    expect(await repo.findHolders(roleId, 'IPL', userIds, today)).toEqual([userIds[0]]);
    expect((await repo.findHolders(roleId, 'IPL', userIds, new Date('2026-03-01'))).sort()).toEqual([userIds[0], userIds[1]].sort());
    expect(await repo.findHolders(roleId, 'IPLFB', userIds, today)).toEqual([userIds[0]]);
  });

  /**
   * @story   US-ADM01-011
   * @ac      AC-US011-01
   * @subtask ST-ADM01-011-BE-04
   * In plain words: supporting test. insertMany writes every row together, or none when one cannot be written.
   */
  it('writes all assignments or none', async () => {
    const badUser = '00000000-0000-4000-8000-000000000000';
    await expect(repo.insertMany([rowFor(userIds[2], 'IPL'), rowFor(badUser, 'IPL')])).rejects.toBeDefined();
    expect(await repo.findHolders(roleId, 'IPL', [userIds[2]], today)).toEqual([]);
    expect(await repo.insertMany([rowFor(userIds[2], 'IPL'), rowFor(userIds[2], 'IPLFB')])).toBe(2);
    expect(await repo.findHolders(roleId, 'IPL', [userIds[2]], today)).toEqual([userIds[2]]);
  });
});

describe('ST-ADM01-003-BE-05 UserCompanyRoleRepository.replaceForUser', () => {
  let prisma: PrismaService;
  let repo: UserCompanyRoleRepository;
  let userId: string;
  const roleIds: string[] = [];
  const row = (roleIdx: number, companyCode: string, validFrom = '2020-01-01') => ({ userId, roleId: roleIds[roleIdx], companyCode, validFrom: new Date(validFrom), assignedBy: '10001' });

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, OrganisationModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(UserCompanyRoleRepository);
    for (const code of ['IPL', 'IPLFB']) await prisma.raw.company.upsert({ where: { code }, update: {}, create: { code, name: code } });
    userId = (await prisma.raw.user.create({ data: { employeeCode: `${stamp.slice(0, 3)}P1`, fullName: 'Replace', email: `p1${stamp}@example.invalid` } })).id;
    for (const n of [0, 1, 2, 3]) roleIds.push((await prisma.raw.role.create({ data: { code: `P${n}${stamp}`, name: `P${n} ${stamp}`, description: 'p', status: 'ACTIVE' } })).id);
    await prisma.raw.userCompanyRole.createMany({
      data: [row(0, 'IPL'), row(1, 'IPL'), row(2, 'IPL', '2999-01-01')].map((r) => ({ ...r, validTo: null })),
    });
  });

  afterAll(async () => {
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.user.delete({ where: { id: userId } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-03
   * @subtask ST-ADM01-003-BE-05
   * In plain words: supporting test. Replacing the roles keeps a role that stays (same row), ends a role that goes (the row is kept, with an end date of yesterday), drops a role that never started, and adds the new one.
   */
  it('keeps, ends, drops and adds company roles', async () => {
    const before = await prisma.raw.userCompanyRole.findMany({ where: { userId } });
    const keptId = before.find((r) => r.roleId === roleIds[0])!.id;
    await repo.replaceForUser(userId, [row(0, 'IPL'), row(3, 'IPLFB')]);
    const after = await prisma.raw.userCompanyRole.findMany({ where: { userId } });
    expect(after.find((r) => r.roleId === roleIds[0])).toMatchObject({ id: keptId, validTo: null });
    const ended = after.find((r) => r.roleId === roleIds[1])!;
    expect(ended.validTo).not.toBeNull();
    expect(ended.validTo!.getTime()).toBeLessThan(Date.now());
    expect(after.find((r) => r.roleId === roleIds[2])).toBeUndefined();
    expect(after.find((r) => r.roleId === roleIds[3])).toMatchObject({ companyCode: 'IPLFB', validTo: null, assignedBy: '10001' });
    const today = await repo.listByUser(userId, 'IPL', new Date());
    expect(today.map((g) => g.roleId)).toEqual([roleIds[0]]);
  });

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-03
   * @subtask ST-ADM01-003-BE-05
   * In plain words: supporting test. Sending the same set again changes nothing, and a new end date is saved on the row that stays.
   */
  it('is repeatable and saves a new end date', async () => {
    const count = () => prisma.raw.userCompanyRole.count({ where: { userId } });
    const n = await count();
    await repo.replaceForUser(userId, [row(0, 'IPL'), row(3, 'IPLFB')]);
    expect(await count()).toBe(n);
    await repo.replaceForUser(userId, [{ ...row(0, 'IPL'), validTo: new Date('2999-12-31') }, row(3, 'IPLFB')]);
    expect((await prisma.raw.userCompanyRole.findFirstOrThrow({ where: { userId, roleId: roleIds[0] } })).validTo).toEqual(new Date('2999-12-31'));
  });
});
