/**
 * @file    masters.repository.spec.ts
 * @module  OrganisationModule
 *
 * @description
 * Supporting tests of the masters adapter (Jest, real PostgreSQL). Written before the code (TDD). They have no test-case ID of their own (decision ST-02); they carry AC-US003-01 and AC-US003-05. In plain words: shows that the adapter knows which departments and designations exist and which designation is the highest.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-06
 * @lld            LLD-EPIC-ADM-01 v0.18 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.18.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/organisation/src/repositories/masters/masters.repository.spec.ts
 * @lld-synced     v0.18
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { MastersDatabaseAdapter } from './database';

const stamp = Date.now().toString(36).slice(-6);

describe('MastersDatabaseAdapter (supporting tests, ST-ADM01-003-BE-06)', () => {
  let prisma: PrismaService;
  let adapter: MastersDatabaseAdapter;
  let deptId: string;
  let normalId: string;
  let topId: string;

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule], providers: [MastersDatabaseAdapter] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    adapter = ref.get(MastersDatabaseAdapter);
    deptId = (await prisma.raw.department.create({ data: { code: `MD${stamp}`, name: `Masters dept ${stamp}` } })).id;
    normalId = (await prisma.raw.designation.create({ data: { code: `MN${stamp}`, name: `Normal ${stamp}`, isHighest: false } })).id;
    topId = (await prisma.raw.designation.create({ data: { code: `MT${stamp}`, name: `Top ${stamp}`, isHighest: true } })).id;
  });

  afterAll(async () => {
    await prisma.raw.designation.deleteMany({ where: { id: { in: [normalId, topId] } } });
    await prisma.raw.department.delete({ where: { id: deptId } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-01
   * @subtask ST-ADM01-003-BE-06
   * In plain words: supporting test. A department or designation that exists is found; an unknown one is not.
   */
  it('knows which departments and designations exist', async () => {
    const none = '00000000-0000-4000-8000-000000000000';
    expect(await adapter.departmentExists(deptId)).toBe(true);
    expect(await adapter.departmentExists(none)).toBe(false);
    expect(await adapter.designationExists(normalId)).toBe(true);
    expect(await adapter.designationExists(none)).toBe(false);
  });

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-05
   * @subtask ST-ADM01-003-BE-06
   * In plain words: supporting test. Only the designation marked highest is the highest; an unknown id is not.
   */
  it('knows the highest designation', async () => {
    expect(await adapter.isHighestDesignation(topId)).toBe(true);
    expect(await adapter.isHighestDesignation(normalId)).toBe(false);
    expect(await adapter.isHighestDesignation('00000000-0000-4000-8000-000000000000')).toBe(false);
  });
});
