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
 * @lld            LLD-EPIC-ADM-01 v0.13 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.13.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user/user.repository.spec.ts
 * @lld-synced     v0.13
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
