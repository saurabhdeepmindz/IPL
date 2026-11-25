/**
 * @file    permission-matrix.e2e-spec.ts
 * @module  AmsApis
 *
 * @description
 * Route tests of the matrix contracts API-PRM-01 to API-PRM-03 on the real application (Jest e2e, real PostgreSQL and Redis). Written before the controller (TDD). In plain words: calls the three matrix routes with a signed-in user and checks the status, the error code and the body.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.14 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.14.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/test/permission-matrix.e2e-spec.ts
 * @lld-synced     v0.14
 * @status         built
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@libs/database';
import { AmsApisModule } from '@app/ams-apis/module';

const stamp = Date.now().toString(36).slice(-5);

describe('ST-ADM01-014-BE-01 matrix routes (C01 to C03)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let targetId: string;
  const roleIds: string[] = [];
  const userIds: string[] = [];
  const http = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const version = async () => (await http().get('/api/v1/roles/permissions/matrix').set(auth()).expect(200)).body.data.matrixVersion as string;
  const change = { permissionKey: 'users.view', allowed: true, scope: 'DEPARTMENT' };

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    const ref = await Test.createTestingModule({ imports: [AmsApisModule] }).compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.raw.company.upsert({ where: { code: 'IPL' }, update: {}, create: { code: 'IPL', name: 'Indian Potash Limited' } });
    const keys = await prisma.raw.permission.findMany({ where: { code: { in: ['roles.view', 'roles.manage', 'users.view'] } } });
    const mk = async (code: string) => (await prisma.raw.role.create({ data: { code: `${code}${stamp}`, name: `${code} ${stamp}`, description: 'e2e', status: 'ACTIVE' } })).id;
    const actorRole = await mk('Mxa');
    targetId = await mk('Mxt');
    roleIds.push(actorRole, targetId);
    for (const k of keys.filter((p) => p.code !== 'users.view')) await prisma.raw.rolePermission.create({ data: { roleId: actorRole, permissionId: k.id, allowed: true, scope: 'COMPANY' } });
    const user = await prisma.raw.user.create({ data: { employeeCode: `x${stamp.slice(0, 4)}`, fullName: 'Matrix E2E', email: `x${stamp}@example.invalid` } });
    userIds.push(user.id);
    await prisma.raw.userCompanyRole.create({ data: { userId: user.id, roleId: actorRole, companyCode: 'IPL', validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
    token = (await http().post('/api/v1/dev/sign-in').send({ employeeCode: `x${stamp.slice(0, 4)}`, companyCode: 'IPL' }).expect(201)).body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.raw.auditLog.deleteMany({ where: { entity: 'PermissionMatrix', reason: { startsWith: `e2e ${stamp}` } } });
    await prisma.raw.permissionMatrixVersion.deleteMany({ where: { reason: { startsWith: `e2e ${stamp}` } } });
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.raw.rolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  /**
   * @tc        TC-ADM01-014-C01
   * @story     US-ADM01-014
   * @ac        AC-US014-01
   * @contract  API-PRM-01
   * @subtask   ST-ADM01-014-BE-01
   * In plain words: the matrix answers 200 with the documented shape; a caller with no token gets 401.
   */
  it('reads the matrix with the documented shape', async () => {
    const res = await http().get('/api/v1/roles/permissions/matrix').set(auth()).expect(200);
    const m = res.body.data;
    expect(m.matrixVersion).toMatch(/^\d+$/);
    expect(m.roles.find((r: { roleId: string }) => r.roleId === targetId)).toEqual({ roleId: targetId, name: `Mxt ${stamp}`, userCount: 0 });
    const users = m.groups.find((g: { module: string }) => g.module === 'users');
    const view = users.permissions.find((p: { key: string }) => p.key === 'users.view');
    expect(Object.keys(view).sort()).toEqual(['cells', 'hint', 'key', 'label']);
    expect(view.cells[targetId]).toEqual({ allowed: false, scope: null, locked: false });
    expect(users.permissions.find((p: { key: string }) => p.key === 'users.manage').cells[targetId].locked).toBe(true);
    await http().get('/api/v1/roles/permissions/matrix').expect(401);
  });

  /**
   * @tc        TC-ADM01-014-C02
   * @story     US-ADM01-014
   * @ac        AC-US014-03
   * @contract  API-PRM-02
   * @subtask   ST-ADM01-014-BE-01
   * In plain words: review answers 200 with rows and warnings and saves nothing; 403 for a locked cell; 422 for an unknown role or an invalid scope.
   */
  it('reviews changes and answers 403 and 422', async () => {
    const before = await version();
    const ok = await http().post('/api/v1/roles/permissions/review').set(auth()).send({ changes: [{ roleId: targetId, ...change }] }).expect(200);
    expect(ok.body.data.warnings).toEqual([]);
    expect(ok.body.data.rows[0]).toMatchObject({ roleName: `Mxt ${stamp}`, permissionKey: 'users.view', before: { allowed: false, scope: null }, after: { allowed: true, scope: 'DEPARTMENT' }, usersAffected: 0, sensitive: false });
    expect(await version()).toBe(before);
    const locked = await http().post('/api/v1/roles/permissions/review').set(auth()).send({ changes: [{ roleId: targetId, permissionKey: 'users.manage', allowed: true }] }).expect(403);
    expect(locked.body.error.code).toBe('LOCKED_CELL');
    const bad = await http().post('/api/v1/roles/permissions/review').set(auth()).send({ changes: [{ roleId: targetId, permissionKey: 'users.view', scope: 'WORLD' }, { roleId: '00000000-0000-4000-8000-000000000000', permissionKey: 'users.view' }] }).expect(422);
    expect(bad.body.error.fields.map((f: { field: string }) => f.field)).toEqual(expect.arrayContaining(['changes.0.scope']));
    const unknown = await http().post('/api/v1/roles/permissions/review').set(auth()).send({ changes: [{ roleId: '00000000-0000-4000-8000-000000000000', permissionKey: 'users.view' }] }).expect(422);
    expect(unknown.body.error.fields[0].field).toBe('changes.0.roleId');
  });

  /**
   * @tc        TC-ADM01-014-C03
   * @story     US-ADM01-014
   * @ac        AC-US014-03
   * @contract  API-PRM-03
   * @subtask   ST-ADM01-014-BE-01
   * In plain words: save answers 200 with saved, auditId and the new version; 409 for an old version; 422 for a missing reason, a bad version or an empty list; 403 for a locked cell.
   */
  it('saves changes and answers 409, 422 and 403', async () => {
    const v = await version();
    const body = { changes: [{ roleId: targetId, ...change }], matrixVersion: v, reason: `e2e ${stamp} save`, approvalReference: 'APR-1' };
    const saved = await http().put('/api/v1/roles/permissions').set(auth()).send(body).expect(200);
    expect(saved.body.data).toEqual({ saved: 1, auditId: expect.stringMatching(/^[0-9a-f-]{36}$/), matrixVersion: String(Number(v) + 1) });
    const stale = await http().put('/api/v1/roles/permissions').set(auth()).send(body).expect(409);
    expect(stale.body.error.code).toBe('STALE_MATRIX');
    const fields = async (b: object) => (await http().put('/api/v1/roles/permissions').set(auth()).send(b).expect(422)).body.error.fields.map((f: { field: string }) => f.field);
    expect(await fields({ ...body, reason: '' })).toContain('reason');
    expect(await fields({ ...body, matrixVersion: 'abc' })).toContain('matrixVersion');
    expect(await fields({ ...body, changes: [] })).toContain('changes');
    const next = await version();
    const locked = await http().put('/api/v1/roles/permissions').set(auth()).send({ ...body, matrixVersion: next, changes: [{ roleId: targetId, permissionKey: 'roles.manage', allowed: true }] }).expect(403);
    expect(locked.body.error.code).toBe('LOCKED_CELL');
  });

  /**
   * @story   US-ADM01-014
   * @ac      AC-US014-02
   * @subtask ST-ADM01-014-BE-01
   * In plain words: supporting test. `PUT /roles/permissions` reaches the matrix controller, not the role route that takes a role id.
   */
  it('routes PUT /roles/permissions to the matrix and not to a role', async () => {
    const res = await http().put('/api/v1/roles/permissions').set(auth()).send({}).expect(422);
    expect(res.body.error.fields.map((f: { field: string }) => f.field)).toEqual(expect.arrayContaining(['matrixVersion']));
  });
});
