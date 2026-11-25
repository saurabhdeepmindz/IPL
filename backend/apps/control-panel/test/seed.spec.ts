/**
 * @file    seed.spec.ts
 * @module  ControlPanel
 *
 * @description
 * Supporting tests of ST-ADM01-000-BE-07, written before the code. In plain words: running a command twice leaves the same rows; the Administrator role is locked and holds the protected rights; every role has a row for every permission; seed:admin fails clearly without its variables.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-07
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { PROTECTED_RIGHTS } from '@libs/roles-and-permissions';
import { PERMISSIONS, PROTECTED_KEYS, SeedAdminCommand, SeedMastersCommand, SeedRolesCommand, STANDARD_ROLES } from '../src/commands';

describe('ST-ADM01-000-BE-07 seeds', () => {
  let prisma: PrismaService;
  let roles: SeedRolesCommand;
  let masters: SeedMastersCommand;
  let admin: SeedAdminCommand;
  const adminCode = '99998';

  beforeAll(async () => {
    const ref = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [SeedRolesCommand, SeedMastersCommand, SeedAdminCommand],
    }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    roles = ref.get(SeedRolesCommand);
    masters = ref.get(SeedMastersCommand);
    admin = ref.get(SeedAdminCommand);
  });

  afterAll(async () => {
    const u = await prisma.raw.user.findUnique({ where: { employeeCode: adminCode } });
    if (u) {
      await prisma.raw.userCompanyRole.deleteMany({ where: { userId: u.id } });
      await prisma.raw.user.delete({ where: { id: u.id } });
    }
    await prisma.onModuleDestroy();
  });

  const counts = async () => ({
    roles: await prisma.raw.role.count(),
    permissions: await prisma.raw.permission.count(),
    cells: await prisma.raw.rolePermission.count(),
    companies: await prisma.raw.company.count(),
    users: await prisma.raw.user.count(),
    grants: await prisma.raw.userCompanyRole.count(),
  });

  it('running every command twice leaves the same rows', async () => {
    const env = { SEED_ADMIN_EMPLOYEE_CODE: adminCode, SEED_ADMIN_EMAIL: 'seed-admin@example.invalid' } as NodeJS.ProcessEnv;
    await masters.run();
    await roles.run();
    await admin.run(env);
    const first = await counts();
    await masters.run();
    await roles.run();
    await admin.run(env);
    expect(await counts()).toEqual(first);
  });

  it('the Administrator role is locked and holds the protected rights', async () => {
    const role = await prisma.raw.role.findUniqueOrThrow({ where: { code: 'ADMINISTRATOR' }, include: { permissions: { include: { permission: true } } } });
    expect(role.isLocked).toBe(true);
    for (const key of PROTECTED_KEYS) {
      expect(role.permissions.find((c) => c.permission.code === key)?.allowed).toBe(true);
    }
  });

  /**
   * @tc      TC-ADM01-010-J07
   * @story   US-ADM01-010
   * @ac      AC-US010-07
   * @subtask ST-ADM01-010-BE-05
   * In plain words: exactly the six SOW roles are seeded, and none is a position on a proposal.
   */
  it('seeds exactly the six SOW roles and no role for a position on a proposal', async () => {
    const six = ['Administrator', 'Auditor', 'Finance', 'Initiator', 'Processor', 'Report Viewer'];
    expect(STANDARD_ROLES.map((r) => r.name).sort()).toEqual(six);
    const names = (await prisma.raw.role.findMany({ where: { type: 'STANDARD' } })).map((r) => r.name).sort();
    expect(names).toEqual(six);
    for (const position of ['First Processor', 'Second Processor', 'Terminator', 'Discussion participant', 'AWI assignee']) {
      expect(await prisma.raw.role.count({ where: { name: position } })).toBe(0);
    }
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-04
   * @subtask ST-ADM01-010-BE-05
   * In plain words: supporting test. The list of protected rights exists in one place only (the roles library), and the seed uses that list.
   */
  it('uses the shared list of protected rights', () => {
    expect(PROTECTED_KEYS).toBe(PROTECTED_RIGHTS);
  });

  it('every standard role has a row for every permission', async () => {
    for (const r of STANDARD_ROLES) {
      const n = await prisma.raw.rolePermission.count({ where: { role: { code: r.code } } });
      expect(n).toBe(PERMISSIONS.length);
    }
  });

  it('seed:admin fails clearly when the variables are missing', async () => {
    await expect(admin.run({} as NodeJS.ProcessEnv)).rejects.toThrow(/SEED_ADMIN_EMPLOYEE_CODE and SEED_ADMIN_EMAIL/);
  });

  it('seed:admin gives the Administrator role in IPL and sets no password', async () => {
    const u = await prisma.raw.user.findUniqueOrThrow({ where: { employeeCode: adminCode }, include: { companyRoles: { include: { role: true } } } });
    expect(u.passwordHash).toBeNull();
    expect(u.companyRoles.map((g) => `${g.companyCode}:${g.role.code}`)).toContain('IPL:ADMINISTRATOR');
  });
});
