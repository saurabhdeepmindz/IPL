/**
 * @file    users.e2e-spec.ts
 * @module  AmsApis
 *
 * @description
 * Route tests of the user contracts API-USR-01 to API-USR-04 on the real application (Jest e2e, real PostgreSQL and Redis). Written before the controller (TDD). In plain words: calls the user routes with a signed-in user and checks the status, the error code and the body. The cases of stories 003 stay `it.todo` until that story is built.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-001, US-ADM01-003
 * @subtask        ST-ADM01-001-BE-04, ST-ADM01-003-BE-06
 * @lld            LLD-EPIC-ADM-01 v0.15 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.15.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/test/users.e2e-spec.ts
 * @lld-synced     v0.15
 * @status         built
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@libs/database';
import { AmsApisModule } from '@app/ams-apis/module';

const stamp = Date.now().toString(36).slice(-5);
const short = stamp.slice(0, 3);
const tag = `LST${stamp}`;

describe('ST-ADM01-001-BE-01 user list route (C01)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};
  const roleIds: string[] = [];
  const userIds: string[] = [];
  const http = () => request(app.getHttpServer());
  const as = (who: string) => ({ Authorization: `Bearer ${tokens[who]}` });
  const list = (who: string, query: object = {}) => http().get('/api/v1/users').query({ q: tag, ...query }).set(as(who));
  const fields = (res: request.Response) => res.body.error.fields.map((f: { field: string }) => f.field);

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    const ref = await Test.createTestingModule({ imports: [AmsApisModule] }).compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    prisma = app.get(PrismaService);
    for (const code of ['IPL', 'IPLFB']) await prisma.raw.company.upsert({ where: { code }, update: {}, create: { code, name: code } });
    const keys = await prisma.raw.permission.findMany({ where: { code: { in: ['users.view', 'companies.view-all'] } } });
    const role = async (code: string, grants: string[]) => {
      const id = (await prisma.raw.role.create({ data: { code: `${code}${stamp}`, name: `${code} ${stamp}`, description: 'e2e', status: 'ACTIVE' } })).id;
      roleIds.push(id);
      for (const k of keys.filter((p) => grants.includes(p.code))) await prisma.raw.rolePermission.create({ data: { roleId: id, permissionId: k.id, allowed: true, scope: 'COMPANY' } });
      return id;
    };
    const user = async (code: string, fullName: string, companyCode: string, roleId: string, extra: object = {}) => {
      const id = (await prisma.raw.user.create({ data: { employeeCode: code, fullName, email: `${code}${stamp}@example.invalid`, ...extra } })).id;
      userIds.push(id);
      await prisma.raw.userCompanyRole.create({ data: { userId: id, roleId, companyCode, validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
    };
    const viewer = await role('Uva', ['users.view']);
    const all = await role('Uvb', ['users.view', 'companies.view-all']);
    const plain = await role('Uvc', []);
    await user(`${short}V1`, 'Viewer', 'IPL', viewer);
    await user(`${short}V2`, 'AllViewer', 'IPL', all);
    await user(`${short}V3`, 'Plain', 'IPL', plain);
    await user(`${short}A1`, `Ann ${tag}`, 'IPL', plain, { authType: 'LOCAL' });
    await user(`${short}A2`, `Ben ${tag}`, 'IPL', plain, { status: 'INACTIVE' });
    await user(`${short}A3`, `Cal ${tag}`, 'IPLFB', plain);
    for (const [who, code] of [['viewer', 'V1'], ['all', 'V2'], ['plain', 'V3']]) {
      tokens[who] = (await http().post('/api/v1/dev/sign-in').send({ employeeCode: `${short}${code}`, companyCode: 'IPL' }).expect(201)).body.data.accessToken;
    }
  });

  afterAll(async () => {
    await prisma.raw.auditLog.deleteMany({ where: { entity: 'UserList', actor: { in: userIds } } });
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.raw.rolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  /**
   * @tc        TC-ADM01-001-C01
   * @story     US-ADM01-001
   * @ac        AC-US001-01
   * @contract  API-USR-01
   * @subtask   ST-ADM01-001-BE-01
   * In plain words: the list answers 200 with the documented fields, the session company only, the defaults and the counts of the four tabs.
   */
  it('lists users with the documented shape', async () => {
    const res = await list('viewer').expect(200);
    const d = res.body.data;
    expect(Object.keys(d).sort()).toEqual(['counts', 'items', 'page', 'pageSize', 'total']);
    expect(d).toMatchObject({ page: 1, pageSize: 25, total: 2, counts: { all: 2, active: 1, inactive: 1, locked: 0 } });
    expect(d.items.map((u: { employeeCode: string }) => u.employeeCode)).toEqual([`${short}A1`, `${short}A2`]);
    expect(Object.keys(d.items[0]).sort()).toEqual(['companies', 'department', 'designation', 'email', 'employeeCode', 'lastSignIn', 'name', 'signIn', 'status']);
    expect(d.items[0]).toMatchObject({ name: `Ann ${tag}`, signIn: 'LOCAL', status: 'ACTIVE', lastSignIn: null, companies: [{ code: 'IPL', roles: [`Uvc ${stamp}`] }] });
    expect((await list('viewer', { status: 'inactive' }).expect(200)).body.data.items).toHaveLength(1);
    expect((await list('viewer', { pageSize: 1, page: 2 }).expect(200)).body.data).toMatchObject({ page: 2, pageSize: 1, total: 2 });
  });

  /**
   * @story   US-ADM01-001
   * @ac      AC-US001-05
   * @subtask ST-ADM01-001-BE-01
   * In plain words: supporting test. An invalid parameter gives 422 naming it; no token gives 401; a user without `users.view` gives 403.
   */
  it('refuses bad parameters, no token and a missing permission', async () => {
    expect(fields(await list('viewer', { pageSize: 0 }).expect(422))).toContain('pageSize');
    expect(fields(await list('viewer', { pageSize: 101 }).expect(422))).toContain('pageSize');
    expect(fields(await list('viewer', { page: 0 }).expect(422))).toContain('page');
    expect(fields(await list('viewer', { status: 'bogus' }).expect(422))).toContain('status');
    expect(fields(await list('viewer', { sort: 'name:sideways' }).expect(422))).toContain('sort');
    expect(fields(await list('viewer', { departmentId: 'not-a-uuid' }).expect(422))).toContain('departmentId');
    await http().get('/api/v1/users').expect(401);
    expect((await list('plain').expect(403)).body.error.code).toBe('FORBIDDEN');
  });

  /**
   * @story   US-ADM01-001
   * @ac      AC-US001-03
   * @subtask ST-ADM01-001-BE-01
   * In plain words: supporting test. ALL companies is refused without `companies.view-all`; with it every company is listed and the use is audited.
   */
  it('allows ALL companies only with the right, and audits it', async () => {
    expect((await list('viewer', { companyCode: 'ALL' }).expect(403)).body.error.code).toBe('COMPANY_MISMATCH');
    const res = await list('all', { companyCode: 'ALL' }).expect(200);
    expect(res.body.data.items.map((u: { employeeCode: string }) => u.employeeCode)).toEqual([`${short}A1`, `${short}A2`, `${short}A3`]);
    expect(await prisma.raw.auditLog.count({ where: { entity: 'UserList', entityKey: 'ALL', actor: { in: userIds } } })).toBe(1);
  });

  it.todo('C02 creates a user and answers 409 and 422');
  it.todo('C03 reads a user');
  it.todo('C04 changes a user');
});
