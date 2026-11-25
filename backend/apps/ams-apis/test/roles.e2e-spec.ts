/**
 * @file    roles.e2e-spec.ts
 * @module  AmsApis
 *
 * @description
 * Route tests of the role contracts API-ROL-01 to API-ROL-04 on the real application (Jest e2e, real PostgreSQL and Redis). Written before the controller (TDD). In plain words: calls the four role routes with a signed-in user and checks the status, the error code and the body.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/test/roles.e2e-spec.ts
 * @lld-synced     v0.25
 * @status         built
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@libs/database';
import { AmsApisModule } from '@app/ams-apis/module';

const stamp = Date.now().toString(36).slice(-5);

describe('ST-ADM01-010-BE-01 role routes (C01 to C04)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let holderRoleId: string;
  let lockedRoleId: string;
  const userIds: string[] = [];
  const http = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    const ref = await Test.createTestingModule({ imports: [AmsApisModule] }).compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.raw.company.upsert({ where: { code: 'IPL' }, update: {}, create: { code: 'IPL', name: 'Indian Potash Limited' } });
    const keys = await prisma.raw.permission.findMany({ where: { code: { in: ['roles.view', 'roles.manage'] } } });
    const mk = async (code: string, extra: object = {}) => (await prisma.raw.role.create({ data: { code: `${code}${stamp}`, name: `${code} ${stamp}`, description: 'e2e', status: 'ACTIVE', ...extra } })).id;
    holderRoleId = await mk('Holder');
    lockedRoleId = await mk('Locked', { isLocked: true });
    for (const k of keys) await prisma.raw.rolePermission.create({ data: { roleId: holderRoleId, permissionId: k.id, allowed: true, scope: 'COMPANY' } });
    const user = await prisma.raw.user.create({ data: { employeeCode: `r${stamp.slice(0, 4)}`, fullName: 'Roles E2E', email: `r${stamp}@example.invalid` } });
    userIds.push(user.id);
    await prisma.raw.userCompanyRole.create({ data: { userId: user.id, roleId: holderRoleId, companyCode: 'IPL', validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
    const res = await http().post('/api/v1/dev/sign-in').send({ employeeCode: `r${stamp.slice(0, 4)}`, companyCode: 'IPL' }).expect(201);
    token = res.body.data.accessToken;
  });

  afterAll(async () => {
    const roles = await prisma.raw.role.findMany({ where: { name: { contains: stamp, mode: 'insensitive' } } });
    const ids = roles.map((r) => r.id);
    await prisma.raw.auditLog.deleteMany({ where: { entityKey: { in: ids } } });
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.raw.rolePermission.deleteMany({ where: { roleId: { in: ids } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: ids } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  /**
   * @tc        TC-ADM01-010-C01
   * @story     US-ADM01-010
   * @ac        AC-US010-01
   * @contract  API-ROL-01
   * @subtask   ST-ADM01-010-BE-01
   * In plain words: the list answers 200 with the documented fields, and the name filter works.
   */
  it('lists roles with the documented fields', async () => {
    const res = await http().get('/api/v1/roles').query({ q: stamp }).set(auth()).expect(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
    expect(Object.keys(res.body.data.items[0]).sort()).toEqual(['description', 'lastChanged', 'name', 'roleId', 'status', 'type', 'userCount']);
    const holder = res.body.data.items.find((r: { roleId: string }) => r.roleId === holderRoleId);
    expect(holder.userCount).toBe(1);
  });

  /**
   * @tc        TC-ADM01-010-C02
   * @story     US-ADM01-010
   * @ac        AC-US010-02
   * @contract  API-ROL-02
   * @subtask   ST-ADM01-010-BE-01
   * In plain words: create answers 201 with the new role id; a duplicate name gives 409; a bad body gives 422 with every invalid field named.
   */
  it('creates a role, refuses a duplicate name and a bad body', async () => {
    const body = { name: `Created ${stamp}`, description: 'c', status: 'ACTIVE', copyFromRoleId: holderRoleId, reason: 'e2e' };
    const created = await http().post('/api/v1/roles').set(auth()).send(body).expect(201);
    expect(created.body.data.roleId).toMatch(/^[0-9a-f-]{36}$/);
    const dup = await http().post('/api/v1/roles').set(auth()).send(body).expect(409);
    expect(dup.body.error.code).toBe('ROLE_NAME_EXISTS');
    const bad = await http().post('/api/v1/roles').set(auth()).send({ name: 'x'.repeat(41), description: 'c', status: 'ACTIVE', permissions: [{ permissionKey: 'users.view', allowed: true, scope: 'WORLD' }] }).expect(422);
    expect(bad.body.error.fields.map((f: { field: string }) => f.field)).toEqual(expect.arrayContaining(['name', 'reason']));
  });

  /**
   * @tc        TC-ADM01-010-C03
   * @story     US-ADM01-010
   * @ac        AC-US010-04
   * @contract  API-ROL-03
   * @subtask   ST-ADM01-010-BE-01
   * In plain words: change answers 200; 404 for no such role; 403 ROLE_LOCKED for a locked role; `PUT /roles/permissions` goes to the matrix route, not to a role.
   */
  it('changes a role and answers 404 and 403 as documented', async () => {
    const changed = await http().put(`/api/v1/roles/${holderRoleId}`).set(auth()).send({ name: `Holder ${stamp}`, description: 'changed', status: 'ACTIVE', reason: 'e2e' }).expect(200);
    expect(changed.body.data.description).toBe('changed');
    const missing = await http().put('/api/v1/roles/00000000-0000-4000-8000-000000000000').set(auth()).send({ name: 'Nope', description: 'n', status: 'ACTIVE', reason: 'e2e' }).expect(404);
    expect(missing.body.error.code).toBe('ROLE_NOT_FOUND');
    // `PUT /roles/permissions` is the matrix route (US-ADM01-014, listed first), so a role body is refused by the matrix validation, not read as a role id.
    await http().put('/api/v1/roles/permissions').set(auth()).send({ name: 'Nope', description: 'n', status: 'ACTIVE', reason: 'e2e' }).expect(422);
    const locked = await http().put(`/api/v1/roles/${lockedRoleId}`).set(auth()).send({ name: `Locked ${stamp}`, description: 'l', status: 'DRAFT', reason: 'e2e' }).expect(403);
    expect(locked.body.error.code).toBe('ROLE_LOCKED');
  });

  /**
   * @tc        TC-ADM01-010-C04
   * @story     US-ADM01-010
   * @ac        AC-US010-05
   * @contract  API-ROL-04
   * @subtask   ST-ADM01-010-BE-01
   * In plain words: deactivate answers 409 ROLE_IN_USE with the count for a held role, and 200 INACTIVE for an unused one.
   */
  it('deactivates only a role that nobody holds', async () => {
    const held = await http().post(`/api/v1/roles/${holderRoleId}/deactivate`).set(auth()).send({ reason: 'e2e' }).expect(409);
    expect(held.body.error.code).toBe('ROLE_IN_USE');
    expect(held.body.error.fields).toEqual([{ field: 'userCount', message: '1' }]);
    const free = (await prisma.raw.role.findFirst({ where: { name: `Created ${stamp}` } }))!.id;
    const done = await http().post(`/api/v1/roles/${free}/deactivate`).set(auth()).send({ reason: 'e2e' }).expect(200);
    expect(done.body.data.status).toBe('INACTIVE');
    await http().post(`/api/v1/roles/${free}/deactivate`).set(auth()).send({}).expect(422);
  });

  /**
   * @story   US-ADM01-010
   * @ac      AC-US010-06
   * @subtask ST-ADM01-010-BE-01
   * In plain words: supporting test. Without the right the routes are refused.
   */
  it('refuses a caller without a token', async () => {
    await http().get('/api/v1/roles').expect(401);
  });
});
