/**
 * @file    users-deactivate.e2e-spec.ts
 * @module  AmsApis
 *
 * @description
 * Route test of API-USR-05 (deactivate a user) on the real application (Jest e2e, real PostgreSQL and Redis). Written before the route (TDD). In plain words: deactivates users through the HTTP route with a signed-in Administrator and checks the status, the error code and the body. The workflow port and the number of active Administrators are replaced in this test module only, so the 409 and 422 answers can be reached without touching the seeded Administrator.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/test/users-deactivate.e2e-spec.ts
 * @lld-synced     v0.24
 * @status         built
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@libs/database';
import { UserDatabaseRepository, UserRepository, WorkflowPort } from '@libs/users';
import { AmsApisModule } from '@app/ams-apis/module';

const stamp = Date.now().toString(36).slice(-5);
const short = stamp.slice(0, 3);

describe('ST-ADM01-005-BE-01 deactivate route (C05)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const state = { held: 0, admins: 2 };
  const tokens: Record<string, string> = {};
  const ids: Record<string, string> = {};
  const roleIds: string[] = [];
  const code = (n: string) => `${short}${n}`;
  const http = () => request(app.getHttpServer());
  const as = (who: string) => ({ Authorization: `Bearer ${tokens[who]}` });
  const deactivate = (who: string, target: string, body: object = { reason: 'LEFT_COMPANY' }) => http().post(`/api/v1/users/${code(target)}/deactivate`).set(as(who)).send(body);

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    class CountedAdmins extends UserDatabaseRepository {
      async adminCount(): Promise<number> {
        return state.admins;
      }
    }
    const ref = await Test.createTestingModule({ imports: [AmsApisModule] })
      .overrideProvider(WorkflowPort)
      .useValue({ countProposalsHeldBy: async () => state.held, monitorUrl: () => 'https://workflow.example.invalid/monitor' })
      .overrideProvider(UserRepository)
      .useFactory({ factory: (p: PrismaService) => new CountedAdmins(p), inject: [PrismaService] })
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.raw.company.upsert({ where: { code: 'IPL' }, update: {}, create: { code: 'IPL', name: 'IPL' } });
    const perms = await prisma.raw.permission.findMany({ where: { code: { in: ['users.manage', 'users.view'] } } });
    const mkRole = async (n: string, grant: boolean, roleCode?: string) => {
      const id = roleCode
        ? (await prisma.raw.role.findUniqueOrThrow({ where: { code: roleCode } })).id
        : (await prisma.raw.role.create({ data: { code: `Ud${n}${stamp}`, name: `Ud${n} ${stamp}`, description: 'e2e', status: 'ACTIVE' } })).id;
      if (!roleCode) roleIds.push(id);
      if (grant) for (const p of perms) await prisma.raw.rolePermission.create({ data: { roleId: id, permissionId: p.id, allowed: true, scope: 'COMPANY' } });
      return id;
    };
    const manager = await mkRole('a', true);
    const plain = await mkRole('p', false);
    const administrator = await mkRole('x', false, 'ADMINISTRATOR');
    const mk = async (who: string, n: string, roleId: string, data: object = {}) => {
      ids[who] = (await prisma.raw.user.create({ data: { employeeCode: code(n), fullName: `Deact ${who}`, email: `${who}${stamp}@example.invalid`, authType: 'LOCAL', ...data } })).id;
      await prisma.raw.userCompanyRole.create({ data: { userId: ids[who], roleId, companyCode: 'IPL', validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
    };
    await mk('admin', 'M1', manager);
    await mk('plain', 'M2', plain);
    await mk('t1', 'T1', plain);
    await mk('t2', 'T2', plain);
    await mk('t3', 'T3', plain);
    await mk('off', 'F1', plain, { status: 'INACTIVE' });
    await mk('last', 'A1', administrator);
    for (const [who, c] of [['admin', 'M1'], ['plain', 'M2']]) tokens[who] = (await http().post('/api/v1/dev/sign-in').send({ employeeCode: code(c), companyCode: 'IPL' }).expect(201)).body.data.accessToken;
  });

  afterAll(async () => {
    const all = Object.values(ids);
    await prisma.raw.auditLog.deleteMany({ where: { entity: 'User', entityKey: { in: all } } });
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: all } } });
    await prisma.raw.rolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: all } } });
    await app.close();
  });

  /**
   * @tc        TC-ADM01-005-C05
   * @story     US-ADM01-005
   * @ac        AC-US005-01
   * @contract  API-USR-05
   * @subtask   ST-ADM01-005-BE-01
   * In plain words: deactivate answers 200 and the user becomes Inactive, stays in the list and cannot sign in; 409 ALREADY_INACTIVE; 404; 422 for the last Administrator and for a bad reason; 401; 403.
   */
  it('deactivates a user and answers 409, 404, 422, 401 and 403', async () => {
    const done = await deactivate('admin', 'T1', { reason: 'LEFT_COMPANY', note: 'Resigned' }).expect(200);
    expect(done.body.data).toEqual({ status: 'INACTIVE' });
    expect(await prisma.raw.user.findUniqueOrThrow({ where: { id: ids.t1 } })).toMatchObject({ status: 'INACTIVE', deactivationReason: 'LEFT_COMPANY', deactivationNote: 'Resigned' });
    const list = await http().get('/api/v1/users').query({ q: code('T1'), status: 'inactive' }).set(as('admin')).expect(200);
    expect(list.body.data.items.map((u: { employeeCode: string }) => u.employeeCode)).toEqual([code('T1')]);
    expect((await http().post('/api/v1/dev/sign-in').send({ employeeCode: code('T1'), companyCode: 'IPL' })).status).not.toBe(201);
    expect(await prisma.raw.auditLog.count({ where: { entity: 'User', entityKey: ids.t1, reason: 'Deactivated: LEFT_COMPANY' } })).toBe(1);
    expect((await deactivate('admin', 'T1').expect(409)).body.error.code).toBe('ALREADY_INACTIVE');
    expect((await deactivate('admin', 'F1').expect(409)).body.error.code).toBe('ALREADY_INACTIVE');
    expect((await http().post('/api/v1/users/99999/deactivate').set(as('admin')).send({ reason: 'OTHER' }).expect(404)).body.error.code).toBe('USER_NOT_FOUND');
    state.admins = 1;
    expect((await deactivate('admin', 'A1').expect(422)).body.error.code).toBe('LAST_ADMINISTRATOR');
    expect((await prisma.raw.user.findUniqueOrThrow({ where: { id: ids.last } })).status).toBe('ACTIVE');
    state.admins = 2;
    const bad = await deactivate('admin', 'T2', { reason: 'BORED' }).expect(422);
    expect(bad.body.error.fields.map((f: { field: string }) => f.field)).toContain('reason');
    await http().post(`/api/v1/users/${code('T2')}/deactivate`).send({ reason: 'OTHER' }).expect(401);
    expect((await deactivate('plain', 'T2').expect(403)).body.error.code).toBe('FORBIDDEN');
    expect((await prisma.raw.user.findUniqueOrThrow({ where: { id: ids.t2 } })).status).toBe('ACTIVE');
  });

  /**
   * @story   US-ADM01-005
   * @ac      AC-US005-02
   * @subtask ST-ADM01-005-BE-01
   * In plain words: supporting test. A user who holds proposals gives 409 HOLDS_PROPOSALS with the count and the monitor address, and nothing changes until the warning is confirmed.
   */
  it('warns about held proposals and deactivates after the confirmation', async () => {
    state.held = 7;
    const warn = await deactivate('admin', 'T3').expect(409);
    expect(warn.body.error.code).toBe('HOLDS_PROPOSALS');
    expect(warn.body.error.fields).toEqual([
      { field: 'count', message: '7' },
      { field: 'workflowMonitorUrl', message: 'https://workflow.example.invalid/monitor' },
      { field: 'hasDelegate', message: 'false' },
    ]);
    expect((await prisma.raw.user.findUniqueOrThrow({ where: { id: ids.t3 } })).status).toBe('ACTIVE');
    await deactivate('admin', 'T3', { reason: 'TRANSFERRED', confirmWithProposals: true }).expect(200);
    expect((await prisma.raw.user.findUniqueOrThrow({ where: { id: ids.t3 } })).status).toBe('INACTIVE');
    state.held = 0;
  });
});
