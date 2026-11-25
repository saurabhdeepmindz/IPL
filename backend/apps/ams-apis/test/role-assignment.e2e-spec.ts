/**
 * @file    role-assignment.e2e-spec.ts
 * @module  AmsApis
 *
 * @description
 * Route tests of the contracts API-ROL-05 and API-ROL-06 on the real application (Jest e2e, real PostgreSQL and Redis). Written before the controller (TDD). In plain words: calls the role details and assign routes with a signed-in user and checks the status, the error code and the body.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/test/role-assignment.e2e-spec.ts
 * @lld-synced     v0.21
 * @status         built
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@libs/database';
import { AmsApisModule } from '@app/ams-apis/module';

const stamp = Date.now().toString(36).slice(-5);
const short = stamp.slice(0, 3);

describe('ST-ADM01-011-BE-01 role assignment routes (C05, C06)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let targetId: string;
  let inactiveId: string;
  const roleIds: string[] = [];
  const userIds: string[] = [];
  const codes = [`${short}A1`, `${short}A2`];
  const http = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const body = (over: object = {}) => ({ employeeCodes: codes, companyCode: 'IPL', validFrom: '2026-01-02', reason: `e2e ${stamp}`, ...over });

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    const ref = await Test.createTestingModule({ imports: [AmsApisModule] }).compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    prisma = app.get(PrismaService);
    for (const code of ['IPL', 'IPLFB']) await prisma.raw.company.upsert({ where: { code }, update: {}, create: { code, name: code } });
    const keys = await prisma.raw.permission.findMany({ where: { code: { in: ['roles.view', 'roles.manage'] } } });
    const mk = async (code: string, status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE') => (await prisma.raw.role.create({ data: { code: `${code}${stamp}`, name: `${code} ${stamp}`, description: 'e2e', status } })).id;
    const actorRole = await mk('Asa');
    targetId = await mk('Ast');
    inactiveId = await mk('Asi', 'INACTIVE');
    roleIds.push(actorRole, targetId, inactiveId);
    for (const k of keys) await prisma.raw.rolePermission.create({ data: { roleId: actorRole, permissionId: k.id, allowed: true, scope: 'COMPANY' } });
    const mkUser = async (employeeCode: string, status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE') => (await prisma.raw.user.create({ data: { employeeCode, fullName: `User ${employeeCode}`, email: `${employeeCode}${stamp}@example.invalid`, status } })).id;
    const actor = await mkUser(`${short}X1`);
    userIds.push(actor, await mkUser(codes[0]), await mkUser(codes[1]), await mkUser(`${short}G1`, 'INACTIVE'));
    await prisma.raw.userCompanyRole.create({ data: { userId: actor, roleId: actorRole, companyCode: 'IPL', validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
    token = (await http().post('/api/v1/dev/sign-in').send({ employeeCode: `${short}X1`, companyCode: 'IPL' }).expect(201)).body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.raw.auditLog.deleteMany({ where: { entity: 'Role', reason: `e2e ${stamp}` } });
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.raw.rolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  /**
   * @tc        TC-ADM01-011-C06
   * @story     US-ADM01-011
   * @ac        AC-US011-01
   * @contract  API-ROL-06
   * @subtask   ST-ADM01-011-BE-01
   * In plain words: assign answers 200 with the count and skips users who already hold the role; 404 for an unknown role or user; 422 for an Inactive role or a bad body; 403 for another company; 401 with no token.
   */
  it('gives a role to users and answers 404, 422, 403 and 401', async () => {
    const url = `/api/v1/roles/${targetId}/users`;
    const done = await http().post(url).set(auth()).send(body()).expect(200);
    expect(done.body.data).toEqual({ assigned: 2 });
    expect((await http().post(url).set(auth()).send(body()).expect(200)).body.data).toEqual({ assigned: 0 });
    const missing = await http().post('/api/v1/roles/00000000-0000-4000-8000-000000000000/users').set(auth()).send(body()).expect(404);
    expect(missing.body.error.code).toBe('ROLE_NOT_FOUND');
    const unknown = await http().post(url).set(auth()).send(body({ employeeCodes: [codes[0], 'ZZZZZ', `${short}G1`] })).expect(404);
    expect(unknown.body.error.code).toBe('USER_NOT_FOUND');
    expect(unknown.body.error.fields.map((f: { message: string }) => f.message)).toEqual(['ZZZZZ', `${short}G1`]);
    expect((await http().post(`/api/v1/roles/${inactiveId}/users`).set(auth()).send(body()).expect(422)).body.error.code).toBe('ROLE_INACTIVE');
    const bad = await http().post(url).set(auth()).send({ employeeCodes: [], companyCode: 'IPL', validFrom: 'tomorrow' }).expect(422);
    expect(bad.body.error.fields.map((f: { field: string }) => f.field)).toEqual(expect.arrayContaining(['employeeCodes', 'validFrom', 'reason']));
    await http().post(url).set(auth()).send(body({ employeeCodes: ['123'] })).expect(422);
    expect((await http().post(url).set(auth()).send(body({ companyCode: 'IPLFB' })).expect(403)).body.error.code).toBe('COMPANY_MISMATCH');
    await http().post(url).send(body()).expect(401);
  });

  /**
   * @tc        TC-ADM01-011-C05
   * @story     US-ADM01-011
   * @ac        AC-US011-02
   * @contract  API-ROL-05
   * @subtask   ST-ADM01-011-BE-01
   * In plain words: the details answer 200 with the role, its users and what it allows; 404 for no such role; ALL companies is refused without the right; 401 with no token.
   */
  it('shows a role with its users and what it allows', async () => {
    await http().post(`/api/v1/roles/${targetId}/users`).set(auth()).send(body()).expect(200);
    const res = await http().get(`/api/v1/roles/${targetId}`).set(auth()).expect(200);
    const d = res.body.data;
    expect(Object.keys(d).sort()).toEqual(['allows', 'description', 'lastChanged', 'name', 'roleId', 'status', 'type', 'userCount', 'users']);
    expect(d.users.map((u: { employeeCode: string }) => u.employeeCode).sort()).toEqual([...codes].sort());
    expect(Object.keys(d.users[0]).sort()).toEqual(['assignedOn', 'company', 'department', 'employeeCode', 'name']);
    expect(d.userCount).toBe(2);
    expect((await http().get(`/api/v1/roles/${targetId}`).query({ companyCode: 'IPL' }).set(auth()).expect(200)).body.data.users).toHaveLength(2);
    expect((await http().get(`/api/v1/roles/${targetId}`).query({ companyCode: 'ALL' }).set(auth()).expect(403)).body.error.code).toBe('COMPANY_MISMATCH');
    expect((await http().get('/api/v1/roles/00000000-0000-4000-8000-000000000000').set(auth()).expect(404)).body.error.code).toBe('ROLE_NOT_FOUND');
    await http().get(`/api/v1/roles/${targetId}`).expect(401);
  });

  /**
   * @story   US-ADM01-011
   * @ac      AC-US011-02
   * @subtask ST-ADM01-011-BE-01
   * In plain words: supporting test. The routes of the other role and matrix controllers still answer as before.
   */
  it('keeps the role list and the matrix routes working', async () => {
    expect((await http().get('/api/v1/roles').set(auth()).expect(200)).body.data.items.length).toBeGreaterThan(0);
    await http().get('/api/v1/roles/permissions/matrix').set(auth()).expect(200);
  });
});
