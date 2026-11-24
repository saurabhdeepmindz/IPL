/**
 * @file    database.spec.ts
 * @module  DatabaseModule
 *
 * @description
 * Supporting tests of ST-ADM01-000-BE-02, written before the code. They run against the local PostgreSQL of docker-compose.
 * In plain words: the company filter never leaks another company's rows, timestamps move on update, the migration is repeatable, and the service can be faked.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-02
 */

import { execSync } from 'node:child_process';
import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { CompanyContext } from './company-context';
import { DatabaseModule } from './module';

const stamp = Date.now().toString(36).slice(-6);
const codeA = `TA${stamp}`.slice(0, 10);
const codeB = `TB${stamp}`.slice(0, 10);

describe('ST-ADM01-000-BE-02 database', () => {
  let prisma: PrismaService;
  let userId: string;
  let roleId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [DatabaseModule] }).compile();
    prisma = moduleRef.get(PrismaService);
    await moduleRef.init();
    await prisma.raw.company.createMany({
      data: [
        { code: codeA, name: 'Test company A' },
        { code: codeB, name: 'Test company B' },
      ],
    });
    const user = await prisma.raw.user.create({
      data: { employeeCode: stamp.slice(0, 5), fullName: 'Test User', email: `t${stamp}@example.invalid` },
    });
    userId = user.id;
    const role = await prisma.raw.role.create({
      data: { code: `T${stamp}`, name: `Test ${stamp}`, description: 'test role' },
    });
    roleId = role.id;
    const today = new Date('2026-01-01');
    await prisma.raw.userCompanyRole.createMany({
      data: [
        { userId, roleId, companyCode: codeA, validFrom: today, assignedBy: '10001' },
        { userId, roleId, companyCode: codeB, validFrom: today, assignedBy: '10001' },
      ],
    });
  });

  afterAll(async () => {
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId } });
    await prisma.raw.role.delete({ where: { id: roleId } });
    await prisma.raw.user.delete({ where: { id: userId } });
    await prisma.raw.company.deleteMany({ where: { code: { in: [codeA, codeB] } } });
    await prisma.onModuleDestroy();
  });

  it('a read for company A never returns a row of company B', async () => {
    const rows = await CompanyContext.run(codeA, async () => await prisma.db.userCompanyRole.findMany({ where: { userId } }));
    expect(rows).toHaveLength(1);
    expect(rows[0].companyCode).toBe(codeA);
  });

  it('count and a single read are filtered in the same way', async () => {
    const count = await CompanyContext.run(codeB, async () => await prisma.db.userCompanyRole.count({ where: { userId } }));
    expect(count).toBe(1);
    const other = await CompanyContext.run(codeA, async () =>
      await prisma.db.userCompanyRole.findFirst({ where: { userId, companyCode: codeB } }),
    );
    expect(other).toBeNull();
  });

  it('a write fills the session company and refuses another one', async () => {
    const made = await CompanyContext.run(codeA, async () =>
      await prisma.db.userCompanyRole.create({
        data: { userId, roleId, validFrom: new Date('2026-02-01'), assignedBy: '10001' } as never,
      }),
    );
    expect(made.companyCode).toBe(codeA);
    await expect(
      CompanyContext.run(codeA, async () =>
        await prisma.db.userCompanyRole.create({
          data: { userId, roleId, companyCode: codeB, validFrom: new Date('2026-02-01'), assignedBy: '10001' },
        }),
      ),
    ).rejects.toThrow(/company/i);
    await prisma.raw.userCompanyRole.delete({ where: { id: made.id } });
  });

  it('an update of a row of company B from company A changes nothing', async () => {
    const result = await CompanyContext.run(codeA, async () =>
      await prisma.db.userCompanyRole.updateMany({ where: { userId, companyCode: codeB }, data: { assignedBy: '99999' } }),
    );
    expect(result.count).toBe(0);
  });

  it('with no company in the context nothing is filtered (seeds and background jobs)', async () => {
    const rows = await prisma.db.userCompanyRole.findMany({ where: { userId } });
    expect(rows).toHaveLength(2);
  });

  it('updatedAt changes on update', async () => {
    const before = await prisma.raw.user.findUniqueOrThrow({ where: { id: userId } });
    await new Promise((r) => setTimeout(r, 20));
    const after = await prisma.raw.user.update({ where: { id: userId }, data: { fullName: 'Test User 2' } });
    expect(after.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());
  });

  it('the migration applies to a second run without change', () => {
    const out = execSync('npx prisma migrate deploy', { encoding: 'utf8', env: process.env });
    expect(out).toMatch(/No pending migrations|already been applied/i);
  });

  it('PrismaService can be replaced by a fake', async () => {
    const fake = { raw: {}, db: { marker: 'fake' }, onModuleInit: jest.fn(), onModuleDestroy: jest.fn() };
    const moduleRef = await Test.createTestingModule({ imports: [DatabaseModule] })
      .overrideProvider(PrismaService)
      .useValue(fake)
      .compile();
    expect((moduleRef.get(PrismaService) as unknown as typeof fake).db.marker).toBe('fake');
  });
});
