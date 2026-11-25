/**
 * @file    users-bulk-create.db.spec.ts
 * @module  UsersModule
 *
 * @description
 * Supporting test of the bulk create against the real database (Jest, real PostgreSQL). Written before the code (TDD). It has no test-case ID of its own (decision ST-02); it carries AC-US009-01. In plain words: shows that the good rows of an import are really saved with their company roles and an audit record, and the bad rows are not.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-01
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/users-bulk-create.db.spec.ts
 * @lld-synced     v0.25
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { UsersModule } from '../module';
import { UserInput } from './user-input-validator';
import { UsersCommandService } from './users-command.service';

const digits = String(Date.now() % 1000).padStart(3, '0');
const stamp = Date.now().toString(36).slice(-6);

describe('UsersCommandService.bulkCreate on the real database (supporting test, ST-ADM01-009-IN-01)', () => {
  let prisma: PrismaService;
  let service: UsersCommandService;
  let roleId: string;
  let deptId: string;
  let topId: string;
  const row = (n: number, over: Partial<UserInput> = {}): UserInput => ({
    employeeCode: `${digits}${n}${n}`, fullName: `Bulk ${n}`, email: `bulk${n}${stamp}@example.invalid`, mobile: null, departmentId: deptId, designationId: topId,
    reportingManagerCode: null, signIn: 'SSO', companies: [{ companyCode: 'IPL', roleIds: [roleId], validFrom: new Date('2026-12-01'), validTo: null }], ...over,
  });

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, UsersModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    service = ref.get(UsersCommandService);
    await prisma.raw.company.upsert({ where: { code: 'IPL' }, update: {}, create: { code: 'IPL', name: 'IPL' } });
    deptId = (await prisma.raw.department.findFirstOrThrow()).id;
    topId = (await prisma.raw.designation.findFirstOrThrow({ where: { isHighest: true } })).id;
    roleId = (await prisma.raw.role.create({ data: { code: `Ub${stamp}`, name: `Ub ${stamp}`, description: 'spec', status: 'ACTIVE' } })).id;
  });

  afterAll(async () => {
    const made = await prisma.raw.user.findMany({ where: { employeeCode: { startsWith: digits } }, select: { id: true } });
    const ids = made.map((u) => u.id);
    await prisma.raw.auditLog.deleteMany({ where: { entity: 'User', entityKey: { in: ids } } });
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: ids } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.raw.role.delete({ where: { id: roleId } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-01
   * @subtask ST-ADM01-009-IN-01
   * In plain words: supporting test. Two good rows and one bad row: the good users exist with their company role and an "Excel import" audit record; the bad row is reported and nothing of it is saved.
   */
  it('saves the good rows and nothing of the bad row', async () => {
    const bad = row(2, { departmentId: '00000000-0000-4000-8000-000000000000' });
    const out = await service.bulkCreate([row(1), bad, row(3)], '10001', '10001');
    expect(out).toEqual({ created: 2, failed: [{ row: 2, field: 'departmentId', message: expect.any(String) }] });
    const saved = await prisma.raw.user.findMany({ where: { employeeCode: { startsWith: digits } }, include: { companyRoles: true } });
    expect(saved.map((u) => u.employeeCode).sort()).toEqual([`${digits}11`, `${digits}33`]);
    expect(saved.every((u) => u.status === 'ACTIVE' && u.companyRoles.length === 1)).toBe(true);
    expect(await prisma.raw.auditLog.count({ where: { entity: 'User', entityKey: { in: saved.map((u) => u.id) }, reason: 'Excel import' } })).toBe(2);
  });
});
