/**
 * @file    user-write.repository.spec.ts
 * @module  UsersModule
 *
 * @description
 * Supporting tests of the user write repository (Jest, real PostgreSQL). Written before the code (TDD). They have no test-case ID of their own (decision ST-02); they carry AC-US007-01, AC-US007-02 and AC-US003-01 to 04. In plain words: shows that unlocking clears the lock, that must-change-password is set and cleared, and that a user is created and changed together with its company roles.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003, US-ADM01-007
 * @subtask        ST-ADM01-003-BE-04, ST-ADM01-007-BE-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user-write/user-write.repository.spec.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { UsersModule } from '../../module';
import { UserRepository } from '../user';
import { UserWriteRepository } from './contract';

const stamp = Date.now().toString(36).slice(-6);

describe('UserWriteRepository (supporting tests, ST-ADM01-007-BE-05)', () => {
  let prisma: PrismaService;
  let repo: UserWriteRepository;
  let userId: string;

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, UsersModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(UserWriteRepository);
    userId = (
      await prisma.raw.user.create({
        data: { employeeCode: `${stamp.slice(0, 3)}W1`, fullName: 'Write User', email: `w${stamp}@example.invalid`, status: 'LOCKED', failedAttempts: 5, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
      })
    ).id;
  });

  afterAll(async () => {
    await prisma.raw.user.delete({ where: { id: userId } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-01
   * @subtask ST-ADM01-007-BE-05
   * In plain words: supporting test. Unlocking sets the user Active and clears the lock time and the failed-attempt count.
   */
  it('unlocks a user and clears the lock', async () => {
    await repo.setStatus(userId, 'ACTIVE', { clearLock: true });
    const u = await prisma.raw.user.findUniqueOrThrow({ where: { id: userId } });
    expect(u).toMatchObject({ status: 'ACTIVE', failedAttempts: 0, lockedUntil: null });
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-02
   * @subtask ST-ADM01-007-BE-05
   * In plain words: supporting test. A user with a one-time password must change it at the first sign-in; the flag can be cleared again.
   */
  it('sets and clears must-change-password', async () => {
    await repo.setMustChangePassword(userId, true);
    expect((await prisma.raw.user.findUniqueOrThrow({ where: { id: userId } })).mustChangePassword).toBe(true);
    await repo.setMustChangePassword(userId, false);
    expect((await prisma.raw.user.findUniqueOrThrow({ where: { id: userId } })).mustChangePassword).toBe(false);
  });
});

describe('UserWriteRepository create and update (supporting tests, ST-ADM01-003-BE-04)', () => {
  let prisma: PrismaService;
  let repo: UserWriteRepository;
  let dept: string;
  let desig: string;
  const roles: string[] = [];
  const made: string[] = [];
  const base = (n: string) => ({ employeeCode: `${stamp.slice(0, 3)}${n}`, fullName: `Create ${n}`, email: `c${n}${stamp}@example.invalid`, mobile: null, departmentId: '', designationId: '', reportingManagerId: null, authType: 'LOCAL' as const });
  const asg = (roleId: string, companyCode = 'IPL') => ({ companyCode, roleId, validFrom: new Date('2026-01-01'), validTo: null, assignedBy: '10001' });

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, UsersModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(UserWriteRepository);
    dept = (await prisma.raw.department.findFirstOrThrow()).id;
    desig = (await prisma.raw.designation.findFirstOrThrow()).id;
    await prisma.raw.company.upsert({ where: { code: 'IPL' }, update: {}, create: { code: 'IPL', name: 'IPL' } });
    for (const n of ['a', 'b']) roles.push((await prisma.raw.role.create({ data: { code: `Uw${n}${stamp}`, name: `Uw${n} ${stamp}`, description: 'spec', status: 'ACTIVE' } })).id);
  });

  afterAll(async () => {
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: made } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: made } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roles } } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-01
   * @subtask ST-ADM01-003-BE-04
   * In plain words: supporting test. Create writes the user as Active with its company roles together, and an unknown role writes nothing at all.
   */
  it('creates a user with company roles together, or nothing', async () => {
    const data = { ...base('C1'), departmentId: dept, designationId: desig };
    const user = await repo.create(data, [asg(roles[0])]);
    made.push(user.id);
    expect(user).toMatchObject({ employeeCode: data.employeeCode, status: 'ACTIVE', companies: [{ code: 'IPL', roles: [`Uwa ${stamp}`] }] });
    expect(await prisma.raw.userCompanyRole.count({ where: { userId: user.id } })).toBe(1);
    const bad = { ...base('C2'), departmentId: dept, designationId: desig };
    await expect(repo.create(bad, [asg('00000000-0000-4000-8000-000000000000')])).rejects.toBeDefined();
    expect(await prisma.raw.user.count({ where: { employeeCode: bad.employeeCode } })).toBe(0);
  });

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-02
   * @subtask ST-ADM01-003-BE-04
   * In plain words: supporting test. The database itself refuses a second user with the same employee code or e-mail.
   */
  it('refuses a used code or e-mail', async () => {
    const data = { ...base('C3'), departmentId: dept, designationId: desig };
    made.push((await repo.create(data, [asg(roles[0])])).id);
    await expect(repo.create({ ...data, email: `other${stamp}@example.invalid` }, [asg(roles[0])])).rejects.toBeDefined();
    await expect(repo.create({ ...data, employeeCode: `${stamp.slice(0, 3)}C4` }, [asg(roles[0])])).rejects.toBeDefined();
  });

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-04
   * @subtask ST-ADM01-003-BE-04
   * In plain words: supporting test. Update changes the fields, can rename the employee code, replaces the company roles when given and leaves them when not.
   */
  it('updates fields, renames the code and replaces roles', async () => {
    const data = { ...base('C5'), departmentId: dept, designationId: desig };
    const user = await repo.create(data, [asg(roles[0])]);
    made.push(user.id);
    const renamed = await repo.update(data.employeeCode, { fullName: 'Changed Name', newEmployeeCode: `${stamp.slice(0, 3)}C6` }, [asg(roles[1])]);
    expect(renamed).toMatchObject({ employeeCode: `${stamp.slice(0, 3)}C6`, fullName: 'Changed Name' });
    expect(renamed.companies).toEqual([{ code: 'IPL', roles: [`Uwb ${stamp}`] }]);
    const kept = await repo.update(`${stamp.slice(0, 3)}C6`, { mobile: '9876543210' }, null);
    expect(kept.mobile).toBe('9876543210');
    expect(kept.companies).toEqual([{ code: 'IPL', roles: [`Uwb ${stamp}`] }]);
  });
});

describe('UserWriteRepository setStatus INACTIVE (supporting tests, ST-ADM01-005-BE-03)', () => {
  let prisma: PrismaService;
  let repo: UserWriteRepository;
  let reads: UserRepository;
  let userId: string;
  let roleId: string;

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, UsersModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(UserWriteRepository);
    reads = ref.get(UserRepository);
    await prisma.raw.company.upsert({ where: { code: 'IPL' }, update: {}, create: { code: 'IPL', name: 'IPL' } });
    roleId = (await prisma.raw.role.create({ data: { code: `Ui${stamp}`, name: `Ui ${stamp}`, description: 'spec', status: 'ACTIVE' } })).id;
    userId = (await prisma.raw.user.create({ data: { employeeCode: `${stamp.slice(0, 3)}I1`, fullName: 'Leaver', email: `i1${stamp}@example.invalid` } })).id;
    await prisma.raw.userCompanyRole.create({ data: { userId, roleId, companyCode: 'IPL', validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
  });

  afterAll(async () => {
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId } });
    await prisma.raw.user.delete({ where: { id: userId } });
    await prisma.raw.role.delete({ where: { id: roleId } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-005
   * @ac      AC-US005-01
   * @subtask ST-ADM01-005-BE-03
   * In plain words: supporting test. Setting a user Inactive saves the date, the reason and the note; the user is not deleted and is still found, with the status Inactive.
   */
  it('saves the deactivation fields and keeps the user', async () => {
    await repo.setStatus(userId, 'INACTIVE', { reason: 'LEFT_COMPANY', note: 'Resigned on 30 Nov' });
    const row = await prisma.raw.user.findUniqueOrThrow({ where: { id: userId } });
    expect(row).toMatchObject({ status: 'INACTIVE', deactivationReason: 'LEFT_COMPANY', deactivationNote: 'Resigned on 30 Nov' });
    expect(row.deactivatedAt).toBeInstanceOf(Date);
    expect((await reads.findByCode(`${stamp.slice(0, 3)}I1`))?.status).toBe('INACTIVE');
    const page = await reads.findPage({ companyCode: 'IPL', status: 'INACTIVE', q: `${stamp.slice(0, 3)}I1` }, { page: 1, pageSize: 10, sort: 'name:asc' });
    expect(page.rows.map((r) => r.employeeCode)).toEqual([`${stamp.slice(0, 3)}I1`]);
  });

  /**
   * @story   US-ADM01-005
   * @ac      AC-US005-01
   * @subtask ST-ADM01-005-BE-03
   * In plain words: supporting test. Setting the user Active again clears the deactivation fields as well as the lock.
   */
  it('clears the deactivation fields when the user is Active again', async () => {
    await repo.setStatus(userId, 'ACTIVE', { clearLock: true });
    expect(await prisma.raw.user.findUniqueOrThrow({ where: { id: userId } })).toMatchObject({ status: 'ACTIVE', deactivatedAt: null, deactivationReason: null, deactivationNote: null });
  });
});
