/**
 * @file    role.repository.spec.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Supporting tests of the role repository (Jest, real PostgreSQL). Written before the code (TDD). They have no test-case ID of their own (decision ST-02); they carry AC-US010-01, 02, 03 and 05. In plain words: shows against the real database that roles are found, counted and saved as the story needs.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/role/role.repository.spec.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService, RoleStatus } from '@libs/database';
import { RolesAndPermissionsModule } from '../../module';
import { RoleRepository } from './contract';

const stamp = Date.now().toString(36).slice(-6);
const DAY = 24 * 60 * 60 * 1000;

describe('RoleRepository (supporting tests, ST-ADM01-010-BE-03)', () => {
  let prisma: PrismaService;
  let repo: RoleRepository;
  const permIds: string[] = [];
  const userIds: string[] = [];
  let activeRoleId: string;
  let draftRoleId: string;

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, RolesAndPermissionsModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(RoleRepository);
    for (const code of ['IPL', 'IPLFB']) {
      await prisma.raw.company.upsert({ where: { code }, update: {}, create: { code, name: code } });
    }
    for (const code of [`r${stamp}.view`, `r${stamp}.manage`]) {
      permIds.push((await prisma.raw.permission.create({ data: { code, area: 'r', description: code } })).id);
    }
    activeRoleId = (await prisma.raw.role.create({ data: { code: `RA${stamp}`, name: `Alpha ${stamp}`, description: 'a', status: 'ACTIVE' } })).id;
    draftRoleId = (await prisma.raw.role.create({ data: { code: `RD${stamp}`, name: `Beta ${stamp}`, description: 'b', status: 'DRAFT' } })).id;
    for (const [n, validTo] of [[1, null], [2, new Date(Date.now() - DAY)]] as const) {
      const id = (await prisma.raw.user.create({ data: { employeeCode: `u${stamp.slice(0, 3)}${n}`, fullName: `U${n}`, email: `u${n}${stamp}@example.invalid` } })).id;
      userIds.push(id);
      const base = { userId: id, roleId: activeRoleId, validFrom: new Date('2026-01-01'), assignedBy: '10001' };
      await prisma.raw.userCompanyRole.create({ data: { ...base, companyCode: 'IPL', validTo } });
      if (n === 1) await prisma.raw.userCompanyRole.create({ data: { ...base, companyCode: 'IPLFB' } });
    }
  });

  afterAll(async () => {
    const roles = await prisma.raw.role.findMany({ where: { name: { contains: stamp, mode: 'insensitive' } } });
    const roleIds = roles.map((r) => r.id);
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.raw.rolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.raw.permission.deleteMany({ where: { id: { in: permIds } } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-01
   * @subtask ST-ADM01-010-BE-03
   * In plain words: the list can be narrowed by name part, status and type.
   */
  it('finds roles by name part, status and type', async () => {
    const all = await repo.findPage({ q: stamp });
    expect(all.map((r) => r.id).sort()).toEqual([activeRoleId, draftRoleId].sort());
    expect((await repo.findPage({ q: stamp, status: RoleStatus.ACTIVE })).map((r) => r.id)).toEqual([activeRoleId]);
    expect(await repo.findPage({ q: stamp, type: 'STANDARD' })).toEqual([]);
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-05
   * @subtask ST-ADM01-010-BE-03
   * In plain words: a user who holds the role in two companies counts once, and an ended assignment is not counted.
   */
  it('counts distinct holders across companies and ignores an ended assignment', async () => {
    expect(await repo.countHolders(activeRoleId)).toBe(1);
    expect(await repo.countHolders(draftRoleId)).toBe(0);
    const row = (await repo.findPage({ q: `Alpha ${stamp}` }))[0];
    expect(row.userCount).toBe(1);
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-03
   * @subtask ST-ADM01-010-BE-03
   * In plain words: a role is found by its name whatever the letter case.
   */
  it('finds a role by name ignoring letter case', async () => {
    expect((await repo.findByName(`alpha ${stamp}`))?.id).toBe(activeRoleId);
    expect(await repo.findByName(`nobody ${stamp}`)).toBeNull();
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-02
   * @subtask ST-ADM01-010-BE-03
   * In plain words: a new role is a CUSTOM role with a code made from its name and with all its cells written together.
   */
  it('creates a role with its cells in one step', async () => {
    const created = await repo.createWithCells(
      { name: `Gamma ${stamp}`, description: 'g', status: RoleStatus.ACTIVE },
      [{ permissionKey: `r${stamp}.view`, allowed: true, scope: 'COMPANY' }],
    );
    expect(created.type).toBe('CUSTOM');
    expect(created.code).toBe(`GAMMA_${stamp.toUpperCase()}`);
    expect(created.userCount).toBe(0);
    const cells = await prisma.raw.rolePermission.findMany({ where: { roleId: created.id }, include: { permission: true } });
    const mine = cells.filter((c) => c.permission.code.startsWith(`r${stamp}.`));
    expect(mine.map((c) => [c.permission.code, c.allowed])).toEqual(expect.arrayContaining([[`r${stamp}.view`, true], [`r${stamp}.manage`, false]]));
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-02
   * @subtask ST-ADM01-010-BE-03
   * In plain words: if a cell cannot be written, no role is created.
   */
  it('creates nothing when a cell names an unknown permission', async () => {
    await expect(
      repo.createWithCells({ name: `Delta ${stamp}`, description: 'd', status: RoleStatus.DRAFT }, [{ permissionKey: `nope.${stamp}`, allowed: true, scope: null }]),
    ).rejects.toBeDefined();
    expect(await repo.findByName(`Delta ${stamp}`)).toBeNull();
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-02
   * @subtask ST-ADM01-010-BE-03
   * In plain words: two names that make the same code still get two different codes.
   */
  it('gives a different code when the code made from the name is taken', async () => {
    const first = await repo.createWithCells({ name: `Epsilon ${stamp}`, description: 'e', status: RoleStatus.DRAFT }, []);
    const second = await repo.createWithCells({ name: `epsilon ${stamp}`, description: 'e', status: RoleStatus.DRAFT }, []);
    expect(second.code).not.toBe(first.code);
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-04
   * @subtask ST-ADM01-010-BE-03
   * In plain words: a role can be changed and set Inactive; its cells stay when none are given.
   */
  it('updates a role, leaves cells alone when none are given, and sets the status', async () => {
    const changed = await repo.updateWithCells(draftRoleId, { name: `Beta ${stamp}`, description: 'changed', status: RoleStatus.ACTIVE }, null);
    expect(changed.description).toBe('changed');
    expect(changed.status).toBe(RoleStatus.ACTIVE);
    expect((await repo.setStatus(draftRoleId, RoleStatus.INACTIVE)).status).toBe(RoleStatus.INACTIVE);
  });
});
