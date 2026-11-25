/**
 * @file    user-form.repository.spec.ts
 * @module  UsersModule
 *
 * @description
 * Supporting tests of the user form repository (Jest, real PostgreSQL). In plain words: shows the Edit form gets the mobile number, the department and designation ids, the reporting manager's code and the assignments valid today per company.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user-form/user-form.repository.spec.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { UsersModule } from '../../module';
import { UserFormRepository } from './contract';

const stamp = Date.now().toString(36).slice(-6);

describe('UserFormRepository.findFormData (supporting test, ST-ADM01-004-BE-01)', () => {
  let prisma: PrismaService;
  let repo: UserFormRepository;
  const made = { users: [] as string[], roles: [] as string[], dept: '', desig: '' };

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, UsersModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(UserFormRepository);
    for (const code of ['IPL', 'IPLFB']) await prisma.raw.company.upsert({ where: { code }, update: {}, create: { code, name: code } });
    made.dept = (await prisma.raw.department.create({ data: { code: `FD${stamp}`, name: `Form dept ${stamp}` } })).id;
    made.desig = (await prisma.raw.designation.create({ data: { code: `FG${stamp}`, name: `Form desig ${stamp}` } })).id;
    for (const n of ['a', 'b']) made.roles.push((await prisma.raw.role.create({ data: { code: `Fr${n}${stamp}`, name: `Fr${n} ${stamp}`, description: 'spec', status: 'ACTIVE' } })).id);
    const boss = await prisma.raw.user.create({ data: { employeeCode: `${stamp.slice(0, 3)}F1`, fullName: 'Form boss', email: `f1${stamp}@example.invalid` } });
    const user = await prisma.raw.user.create({ data: { employeeCode: `${stamp.slice(0, 3)}F2`, fullName: 'Form user', email: `f2${stamp}@example.invalid`, mobile: '9876543210', departmentId: made.dept, designationId: made.desig, reportingManagerId: boss.id } });
    made.users.push(user.id, boss.id);
    const row = (roleId: string, companyCode: string, validFrom: string, validTo: string | null) => ({ userId: user.id, roleId, companyCode, validFrom: new Date(validFrom), validTo: validTo ? new Date(validTo) : null, assignedBy: '10001' });
    await prisma.raw.userCompanyRole.createMany({ data: [row(made.roles[0], 'IPL', '2026-01-01', null), row(made.roles[1], 'IPL', '2026-01-01', '2999-12-31'), row(made.roles[0], 'IPLFB', '2026-02-01', null), row(made.roles[1], 'IPLFB', '2020-01-01', '2020-12-31')] });
  });

  afterAll(async () => {
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: made.users } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: made.users } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: made.roles } } });
    await prisma.raw.department.delete({ where: { id: made.dept } });
    await prisma.raw.designation.delete({ where: { id: made.desig } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-004
   * @ac      AC-US004-04
   * @subtask ST-ADM01-004-BE-01
   * In plain words: supporting test. The form data has the mobile number, the department and designation ids, the reporting manager's code and, per company, the role ids with valid-from and valid-to of the assignments valid today (an ended assignment is not returned).
   */
  it('returns the data the Edit form needs', async () => {
    const form = await repo.findFormData(`${stamp.slice(0, 3)}F2`);
    expect(form).toMatchObject({ mobile: '9876543210', departmentId: made.dept, designationId: made.desig, reportingManagerCode: `${stamp.slice(0, 3)}F1` });
    const byCompany = Object.fromEntries((form?.companies ?? []).map((c) => [c.companyCode, c]));
    expect(Object.keys(byCompany).sort()).toEqual(['IPL', 'IPLFB']);
    expect([...byCompany.IPL.roleIds].sort()).toEqual([...made.roles].sort());
    expect(byCompany.IPL).toMatchObject({ validFrom: '2026-01-01', validTo: null });
    expect(byCompany.IPLFB.roleIds).toEqual([made.roles[0]]);
    expect(byCompany.IPLFB.validFrom).toBe('2026-02-01');
  });

  /**
   * @story   US-ADM01-004
   * @ac      AC-US004-04
   * @subtask ST-ADM01-004-BE-01
   * In plain words: supporting test. A user with no reporting manager gives null for it, and an unknown code gives null.
   */
  it('gives null for no manager and for an unknown user', async () => {
    expect((await repo.findFormData(`${stamp.slice(0, 3)}F1`))?.reportingManagerCode).toBeNull();
    expect(await repo.findFormData('ZZZZZ')).toBeNull();
  });
});
