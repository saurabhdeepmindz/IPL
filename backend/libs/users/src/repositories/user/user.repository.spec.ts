/**
 * @file    user.repository.spec.ts
 * @module  UsersModule
 *
 * @description
 * Supporting tests of the minimal user repository (Jest, real PostgreSQL). Written before the code (TDD). They have no test-case ID of their own (decision ST-02); they carry AC-US011-01. In plain words: shows that users are found by employee code with the name of their department.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.18 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.18.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user/user.repository.spec.ts
 * @lld-synced     v0.18
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { UsersModule } from '../../module';
import { UserRepository } from './contract';

const stamp = Date.now().toString(36).slice(-6);

describe('UserRepository (supporting tests, ST-ADM01-011-BE-04)', () => {
  let prisma: PrismaService;
  let repo: UserRepository;
  let deptId: string;
  const userIds: string[] = [];
  const code = (n: number) => `${stamp.slice(0, 3)}V${n}`;

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, UsersModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(UserRepository);
    deptId = (await prisma.raw.department.create({ data: { code: `U${stamp}`, name: `Users dept ${stamp}` } })).id;
    userIds.push((await prisma.raw.user.create({ data: { employeeCode: code(1), fullName: 'With Dept', email: `v1${stamp}@example.invalid`, departmentId: deptId } })).id);
    userIds.push((await prisma.raw.user.create({ data: { employeeCode: code(2), fullName: 'No Dept', email: `v2${stamp}@example.invalid`, status: 'INACTIVE' } })).id);
  });

  afterAll(async () => {
    await prisma.raw.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.raw.department.delete({ where: { id: deptId } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-011
   * @ac      AC-US011-01
   * @subtask ST-ADM01-011-BE-04
   * In plain words: supporting test. findByCodes returns each user with status and department name, and leaves out a code that matches nobody.
   */
  it('finds users by employee code with the department name', async () => {
    const found = await repo.findByCodes([code(1), code(2), 'ZZZZZ']);
    expect(found.map((u) => u.employeeCode).sort()).toEqual([code(1), code(2)].sort());
    expect(found.find((u) => u.employeeCode === code(1))).toMatchObject({ id: userIds[0], fullName: 'With Dept', status: 'ACTIVE', departmentName: `Users dept ${stamp}` });
    expect(found.find((u) => u.employeeCode === code(2))).toMatchObject({ status: 'INACTIVE', departmentName: null });
  });

  /**
   * @story   US-ADM01-011
   * @ac      AC-US011-01
   * @subtask ST-ADM01-011-BE-04
   * In plain words: supporting test. No codes gives no users.
   */
  it('returns nothing for an empty list', async () => {
    expect(await repo.findByCodes([])).toEqual([]);
  });
});

describe('ST-ADM01-001-BE-03 UserRepository: list, counts, lookups and adminCount', () => {
  let prisma: PrismaService;
  let repo: UserRepository;
  let deptA: string;
  let deptB: string;
  let roleA: string;
  let roleB: string;
  let adminRole: string;
  const ids: Record<string, string> = {};
  const key = stamp;
  const name = (n: string) => `${n} ${key}`;
  const codeOf = (n: number) => `${stamp.slice(0, 3)}L${n}`;
  const emailOf = (n: string) => `${n.toLowerCase()}.${key}@example.invalid`;
  const base = { companyCode: 'IPL', q: key } as const;
  const codes = async (filter: object, sort = 'name:asc', page = 1, pageSize = 50) => {
    const out = await repo.findPage({ companyCode: 'IPL', q: key, ...filter } as never, { page, pageSize, sort });
    return { total: out.total, codes: out.rows.map((r) => r.employeeCode) };
  };
  const give = (userId: string, roleId: string, companyCode: string, validTo: Date | null = null) =>
    prisma.raw.userCompanyRole.create({ data: { userId, roleId, companyCode, validFrom: new Date('2026-01-01'), validTo, assignedBy: '10001' } });

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, UsersModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(UserRepository);
    for (const code of ['IPL', 'IPLFB']) await prisma.raw.company.upsert({ where: { code }, update: {}, create: { code, name: code } });
    deptA = (await prisma.raw.department.create({ data: { code: `LA${stamp}`, name: `Dept A ${key}` } })).id;
    deptB = (await prisma.raw.department.create({ data: { code: `LB${stamp}`, name: `Dept B ${key}` } })).id;
    roleA = (await prisma.raw.role.create({ data: { code: `LRA${stamp}`, name: `Role A ${key}`, description: 'a', status: 'ACTIVE' } })).id;
    roleB = (await prisma.raw.role.create({ data: { code: `LRB${stamp}`, name: `Role B ${key}`, description: 'b', status: 'ACTIVE' } })).id;
    adminRole = (await prisma.raw.role.findUniqueOrThrow({ where: { code: 'ADMINISTRATOR' } })).id;
    const mk = async (n: number, who: string, data: object) =>
      (ids[who] = (await prisma.raw.user.create({ data: { employeeCode: codeOf(n), fullName: name(who), email: emailOf(who), ...data } })).id);
    await mk(1, 'Alice', { departmentId: deptA, authType: 'LOCAL' });
    await mk(2, 'Bob', { departmentId: deptB, authType: 'SSO' });
    await mk(3, 'Carol', { departmentId: deptA, status: 'INACTIVE' });
    await mk(4, 'Dave', { status: 'LOCKED' });
    await mk(5, 'Eve', {});
    await give(ids.Alice, roleA, 'IPL');
    await give(ids.Bob, roleB, 'IPL');
    await give(ids.Carol, roleA, 'IPL', new Date('2026-06-30'));
    await give(ids.Dave, roleA, 'IPLFB');
  });

  afterAll(async () => {
    const all = Object.values(ids);
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: all } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: all } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: [roleA, roleB] } } });
    await prisma.raw.department.deleteMany({ where: { id: { in: [deptA, deptB] } } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-001
   * @ac      AC-US001-01
   * @subtask ST-ADM01-001-BE-03
   * In plain words: supporting test. A company lists the users with a role row in it, valid or ended; ALL lists every company; a user with no row is never listed.
   */
  it('lists the users of a company, leavers included, and every company for ALL', async () => {
    expect((await codes({})).codes).toEqual([codeOf(1), codeOf(2), codeOf(3)]);
    expect((await codes({ companyCode: 'IPLFB' })).codes).toEqual([codeOf(4)]);
    expect((await codes({ companyCode: null })).codes).toEqual([codeOf(1), codeOf(2), codeOf(3), codeOf(4)]);
  });

  /**
   * @story   US-ADM01-001
   * @ac      AC-US001-02
   * @subtask ST-ADM01-001-BE-03
   * In plain words: supporting test. Search matches employee code, name and e-mail whatever the letter case; filters narrow by department, role, sign-in type and status.
   */
  it('searches and filters', async () => {
    expect((await codes({ q: `ALICE ${key}` })).codes).toEqual([codeOf(1)]);
    expect((await codes({ q: codeOf(2) })).codes).toEqual([codeOf(2)]);
    expect((await codes({ q: `bob.${key}` })).codes).toEqual([codeOf(2)]);
    expect((await codes({ departmentId: deptA })).codes).toEqual([codeOf(1), codeOf(3)]);
    expect((await codes({ roleId: roleB })).codes).toEqual([codeOf(2)]);
    expect((await codes({ signIn: 'LOCAL' })).codes).toEqual([codeOf(1)]);
    expect((await codes({ status: 'INACTIVE' })).codes).toEqual([codeOf(3)]);
    expect(await codes({ q: `nobody-${key}` })).toEqual({ total: 0, codes: [] });
  });

  /**
   * @story   US-ADM01-001
   * @ac      AC-US001-05
   * @subtask ST-ADM01-001-BE-03
   * In plain words: supporting test. The list can be ordered by name, code, status or department and paged; the total is the whole count.
   */
  it('orders and pages', async () => {
    expect((await codes({}, 'name:desc')).codes).toEqual([codeOf(3), codeOf(2), codeOf(1)]);
    expect((await codes({}, 'employeeCode:asc')).codes).toEqual([codeOf(1), codeOf(2), codeOf(3)]);
    expect((await codes({}, 'status:asc')).codes).toEqual([codeOf(1), codeOf(2), codeOf(3)]);
    expect((await codes({}, 'status:desc')).codes[0]).toBe(codeOf(3));
    const second = await codes({}, 'name:asc', 2, 2);
    expect(second).toEqual({ total: 3, codes: [codeOf(3)] });
  });

  /**
   * @story   US-ADM01-001
   * @ac      AC-US001-01
   * @subtask ST-ADM01-001-BE-03
   * In plain words: supporting test. The counts group by status and ignore the status tab, so each tab shows how many it would hold.
   */
  it('counts users by status and ignores the status tab', async () => {
    expect(await repo.countByStatus({ ...base })).toEqual({ ACTIVE: 2, INACTIVE: 1, LOCKED: 0 });
    expect(await repo.countByStatus({ ...base, status: 'ACTIVE' })).toEqual({ ACTIVE: 2, INACTIVE: 1, LOCKED: 0 });
    expect(await repo.countByStatus({ ...base, companyCode: null })).toEqual({ ACTIVE: 2, INACTIVE: 1, LOCKED: 1 });
    expect(await repo.countByStatus({ ...base, signIn: 'LOCAL' })).toEqual({ ACTIVE: 1, INACTIVE: 0, LOCKED: 0 });
  });

  /**
   * @story   US-ADM01-001
   * @ac      AC-US001-01
   * @subtask ST-ADM01-001-BE-03
   * In plain words: supporting test. A user comes back with department, sign-in type and the roles by company; lookups by code and by e-mail (any letter case) find the same user.
   */
  it('returns a full record and finds a user by code or e-mail', async () => {
    const [row] = (await repo.findPage({ ...base, q: `alice ${key}` }, { page: 1, pageSize: 10, sort: 'name:asc' })).rows;
    expect(row).toMatchObject({ employeeCode: codeOf(1), fullName: name('Alice'), departmentName: `Dept A ${key}`, authType: 'LOCAL', status: 'ACTIVE', companies: [{ code: 'IPL', roles: [`Role A ${key}`] }] });
    expect((await repo.findByCode(codeOf(1)))?.id).toBe(ids.Alice);
    expect((await repo.findByEmail(emailOf('Alice').toUpperCase()))?.id).toBe(ids.Alice);
    expect(await repo.findByCode('ZZZZZ')).toBeNull();
    expect(await repo.findByEmail('nobody@example.invalid')).toBeNull();
  });

  /**
   * @story   US-ADM01-001
   * @ac      AC-US001-01
   * @subtask ST-ADM01-001-BE-03
   * In plain words: supporting test. adminCount counts Active users who hold the Administrator role today; an Inactive user or an ended assignment does not count.
   */
  it('counts the active Administrators across companies', async () => {
    const before = await repo.adminCount();
    await give(ids.Alice, adminRole, 'IPL');
    await give(ids.Carol, adminRole, 'IPL');
    await give(ids.Bob, adminRole, 'IPLFB', new Date('2026-01-31'));
    expect(await repo.adminCount()).toBe(before + 1);
  });

  /**
   * @story   US-ADM01-005
   * @ac      AC-US005-01
   * @subtask ST-ADM01-005-BE-02
   * In plain words: supporting test. isAdministrator is true for a user who holds the Administrator role today and false for a user whose assignment has ended or who holds another role.
   */
  it('knows who holds the Administrator role today', async () => {
    expect(await repo.isAdministrator(ids.Alice)).toBe(true);
    expect(await repo.isAdministrator(ids.Bob)).toBe(false);
    expect(await repo.isAdministrator('00000000-0000-4000-8000-000000000000')).toBe(false);
  });
});
