/**
 * @file    masters-read.repository.spec.ts
 * @module  Tests
 *
 * @description
 * Supporting tests of the masters read repository (Jest, real PostgreSQL). In plain words: the three lists come back ordered, with the highest designation marked and only active companies.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/organisation/src/repositories/masters-read/masters-read.repository.spec.ts
 * @lld-synced     v0.24
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { OrganisationModule } from '../../module';
import { MastersReadRepository } from './contract';

const stamp = Date.now().toString(36).slice(-6);

describe('MastersReadRepository (supporting tests)', () => {
  let prisma: PrismaService;
  let repo: MastersReadRepository;
  const made = { dept: [] as string[], desig: [] as string[], company: [] as string[] };

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, OrganisationModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(MastersReadRepository);
    for (const [n, name] of [['b', `~Bravo ${stamp}`], ['a', `~Alpha ${stamp}`]]) made.dept.push((await prisma.raw.department.create({ data: { code: `MD${n}${stamp}`, name } })).id);
    made.desig.push((await prisma.raw.designation.create({ data: { code: `MG${stamp}`, name: `~Top ${stamp}`, isHighest: true } })).id);
    made.desig.push((await prisma.raw.designation.create({ data: { code: `MH${stamp}`, name: `~Normal ${stamp}`, isHighest: false } })).id);
    made.company.push((await prisma.raw.company.create({ data: { code: `MA${stamp}`.slice(0, 10), name: 'Active spec company', isActive: true } })).code);
    made.company.push((await prisma.raw.company.create({ data: { code: `MI${stamp}`.slice(0, 10), name: 'Inactive spec company', isActive: false } })).code);
  });

  afterAll(async () => {
    await prisma.raw.department.deleteMany({ where: { id: { in: made.dept } } });
    await prisma.raw.designation.deleteMany({ where: { id: { in: made.desig } } });
    await prisma.raw.company.deleteMany({ where: { code: { in: made.company } } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-002
   * @ac      AC-US002-02
   * @subtask ST-ADM01-002-BE-01
   * In plain words: supporting test. Departments are returned ordered by name with their id and code.
   */
  it('reads the departments by name', async () => {
    const rows = (await repo.departments()).filter((d) => d.name.endsWith(stamp));
    expect(rows.map((d) => d.name)).toEqual([`~Alpha ${stamp}`, `~Bravo ${stamp}`]);
    expect(rows[0]).toMatchObject({ code: `MDa${stamp}` });
    expect(rows[0].id).toMatch(/^[0-9a-f-]{36}$/);
  });

  /**
   * @story   US-ADM01-002
   * @ac      AC-US002-02
   * @subtask ST-ADM01-002-BE-01
   * In plain words: supporting test. Designations are returned by name with the flag of the highest one.
   */
  it('reads the designations with the highest one marked', async () => {
    const rows = (await repo.designations()).filter((d) => d.name.endsWith(stamp));
    expect(rows.map((d) => [d.name, d.isHighest])).toEqual([[`~Normal ${stamp}`, false], [`~Top ${stamp}`, true]]);
  });

  /**
   * @story   US-ADM01-002
   * @ac      AC-US002-02
   * @subtask ST-ADM01-002-BE-01
   * In plain words: supporting test. Only active companies are returned, with code and name.
   */
  it('reads the active companies only', async () => {
    const codes = (await repo.companies()).map((c) => c.code);
    expect(codes).toContain(`MA${stamp}`.slice(0, 10));
    expect(codes).not.toContain(`MI${stamp}`.slice(0, 10));
    expect(await repo.companies()).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'IPL' })]));
  });
});
