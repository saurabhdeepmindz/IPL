/**
 * @file    users-write.e2e-spec.ts
 * @module  AmsApis
 *
 * @description
 * Route tests of API-USR-02 to API-USR-04 on the real application (Jest e2e, real PostgreSQL and Redis). Written before the routes (TDD). In plain words: creates, reads and changes users through the HTTP routes with a signed-in Administrator and checks the status, the error code and the body.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/test/users-write.e2e-spec.ts
 * @lld-synced     v0.27
 * @status         built
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RedisService } from '@libs/core';
import { PrismaService } from '@libs/database';
import { AmsApisModule } from '@app/ams-apis/module';

const stamp = Date.now().toString(36).slice(-5);
const digits = String(Date.now() % 1000).padStart(3, '0');

describe('ST-ADM01-003-BE-01 user write routes (C02 to C04)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let deptId: string;
  let desigId: string;
  const tokens: Record<string, string> = {};
  const roleIds: string[] = [];
  const userIds: string[] = [];
  const keys: string[] = [];
  // Employee codes are 5 digits: three from the clock, then a letter of the test user (W, N, R, U) as 0..3 and its number.
  const code = (n: string) => `${digits}${'WNRU'.indexOf(n[0])}${n[1]}`;
  const http = () => request(app.getHttpServer());
  const as = (who: string) => ({ Authorization: `Bearer ${tokens[who]}` });
  const fields = (res: request.Response) => res.body.error.fields.map((f: { field: string }) => f.field);
  const body = (n: string, over: object = {}) => ({
    employeeCode: code(n), fullName: `Route ${n}`, email: `r${n.toLowerCase()}${stamp}@example.invalid`, mobile: '9876543210', departmentId: deptId, designationId: desigId,
    reportingManagerCode: code('W1'), signIn: 'LOCAL', companies: [{ companyCode: 'IPL', roleIds: [roleIds[2]], validFrom: '2026-12-01' }], ...over,
  });
  const create = (who: string, payload: object, key = `k-${Math.random()}`) => {
    keys.push(key);
    return http().post('/api/v1/users').set({ ...as(who), 'Idempotency-Key': key }).send(payload);
  };

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    const ref = await Test.createTestingModule({ imports: [AmsApisModule] }).compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    prisma = app.get(PrismaService);
    for (const c of ['IPL', 'IPLFB']) await prisma.raw.company.upsert({ where: { code: c }, update: {}, create: { code: c, name: c } });
    deptId = (await prisma.raw.department.findFirstOrThrow()).id;
    desigId = (await prisma.raw.designation.findFirstOrThrow({ where: { isHighest: false } })).id;
    const perms = await prisma.raw.permission.findMany({ where: { code: { in: ['users.view', 'users.manage'] } } });
    const role = async (n: string, grants: string[]) => {
      const id = (await prisma.raw.role.create({ data: { code: `Uw${n}${stamp}`, name: `Uw${n} ${stamp}`, description: 'e2e', status: 'ACTIVE' } })).id;
      roleIds.push(id);
      for (const p of perms.filter((x) => grants.includes(x.code))) await prisma.raw.rolePermission.create({ data: { roleId: id, permissionId: p.id, allowed: true, scope: 'COMPANY' } });
      return id;
    };
    const admin = await role('a', ['users.view', 'users.manage']);
    const plain = await role('p', []);
    await role('t', []);
    for (const [who, n, roleId] of [['admin', 'W1', admin], ['plain', 'W2', plain]]) {
      const id = (await prisma.raw.user.create({ data: { employeeCode: code(n), fullName: `Writer ${n}`, email: `w${n.toLowerCase()}${stamp}@example.invalid` } })).id;
      userIds.push(id);
      await prisma.raw.userCompanyRole.create({ data: { userId: id, roleId, companyCode: 'IPL', validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
      tokens[who] = (await http().post('/api/v1/dev/sign-in').send({ employeeCode: code(n), companyCode: 'IPL' }).expect(201)).body.data.accessToken;
    }
  });

  afterAll(async () => {
    const made = await prisma.raw.user.findMany({ where: { employeeCode: { startsWith: digits }, email: { endsWith: `${stamp}@example.invalid` } }, select: { id: true } });
    const all = [...new Set([...userIds, ...made.map((u) => u.id)])];
    await prisma.raw.auditLog.deleteMany({ where: { entity: 'User', entityKey: { in: all } } });
    await prisma.raw.oneTimePassword.deleteMany({ where: { userId: { in: all } } });
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: all } } });
    await prisma.raw.rolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: all } } });
    await app.get(RedisService).deleteByPrefix('idem:users:');
    await app.close();
  });

  /**
   * @tc        TC-ADM01-003-C02
   * @story     US-ADM01-003
   * @ac        AC-US003-01
   * @contract  API-USR-02
   * @subtask   ST-ADM01-003-BE-01
   * In plain words: create answers 201 with the one-time password status; a repeated key returns the first answer and creates one user; 409 for a used code or e-mail; 422 for bad fields or a missing key; 401; 403.
   */
  it('creates a user and answers 409, 422, 401 and 403', async () => {
    const first = await create('admin', body('N1'), 'same-key').expect(201);
    expect(first.body.data).toEqual({ employeeCode: code('N1'), status: 'ACTIVE', oneTimePassword: { required: true, emailStatus: 'SENT' } });
    const row = await prisma.raw.user.findUniqueOrThrow({ where: { employeeCode: code('N1') }, include: { companyRoles: true } });
    expect(row).toMatchObject({ status: 'ACTIVE', authType: 'LOCAL', mustChangePassword: true });
    expect(row.companyRoles).toHaveLength(1);
    expect(await prisma.raw.auditLog.count({ where: { entity: 'User', entityKey: row.id, reason: 'Created' } })).toBe(1);
    expect(JSON.stringify(first.body)).not.toMatch(/password":"/i);
    const again = await create('admin', body('N1'), 'same-key').expect(201);
    expect(again.body).toEqual(first.body);
    expect(await prisma.raw.user.count({ where: { employeeCode: code('N1') } })).toBe(1);
    expect((await create('admin', body('N1', { email: `other${stamp}@example.invalid` })).expect(409)).body.error.code).toBe('DUPLICATE_EMPLOYEE_CODE');
    expect((await create('admin', body('N2', { email: body('N1').email.toUpperCase() })).expect(409)).body.error.code).toBe('DUPLICATE_EMAIL');
    expect(fields(await create('admin', body('N3', { employeeCode: '12', email: 'bad' })).expect(422))).toEqual(expect.arrayContaining(['employeeCode', 'email']));
    const unknownDept = await create('admin', body('N4', { departmentId: '00000000-0000-4000-8000-000000000000', reportingManagerCode: null })).expect(422);
    expect(fields(unknownDept)).toEqual(expect.arrayContaining(['departmentId', 'reportingManagerCode']));
    expect(fields(await http().post('/api/v1/users').set(as('admin')).send(body('N5')).expect(422))).toContain('Idempotency-Key');
    await http().post('/api/v1/users').send(body('N6')).expect(401);
    expect((await create('plain', body('N7')).expect(403)).body.error.code).toBe('FORBIDDEN');
  });

  /**
   * @tc        TC-ADM01-003-C03
   * @story     US-ADM01-003
   * @ac        AC-US003-03
   * @contract  API-USR-03
   * @subtask   ST-ADM01-003-BE-01
   * In plain words: reading one user answers 200 with both companies, the summary sentence and the activity; 404 for an unknown code; 401; 403.
   */
  it('reads a user with two companies and answers 404, 401 and 403', async () => {
    const id = (await prisma.raw.user.create({ data: { employeeCode: code('R1'), fullName: 'Two Companies', email: `r1${stamp}@example.invalid` } })).id;
    userIds.push(id);
    for (const c of ['IPL', 'IPLFB']) await prisma.raw.userCompanyRole.create({ data: { userId: id, roleId: roleIds[2], companyCode: c, validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
    await prisma.raw.auditLog.create({ data: { actor: 'system', kind: 'CHANGE', entity: 'User', entityKey: id, reason: 'Seeded for the test' } });
    const res = await http().get(`/api/v1/users/${code('R1')}`).set(as('admin')).expect(200);
    expect(res.body.data).toMatchObject({ employeeCode: code('R1'), name: 'Two Companies', signInLocked: false, firstSignInAt: null });
    expect(res.body.data.companies.map((c: { code: string }) => c.code).sort()).toEqual(['IPL', 'IPLFB']);
    expect(res.body.data.summaryText).toBe(`Company IPL: Uwt ${stamp}. Company IPLFB: Uwt ${stamp}.`);
    expect(res.body.data.form.companies.map((c: { companyCode: string }) => c.companyCode).sort()).toEqual(['IPL', 'IPLFB']);
    expect(res.body.data.form.companies[0]).toMatchObject({ roleIds: [roleIds[2]], validFrom: '2026-01-01', validTo: null });
    expect(res.body.data.form).toHaveProperty('reportingManagerCode', null);
    expect(res.body.data.activity).toEqual([{ at: expect.any(String), text: 'Seeded for the test' }]);
    expect((await http().get('/api/v1/users/99999').set(as('admin')).expect(404)).body.error.code).toBe('USER_NOT_FOUND');
    await http().get(`/api/v1/users/${code('R1')}`).expect(401);
    expect((await http().get(`/api/v1/users/${code('R1')}`).set(as('plain')).expect(403)).body.error.code).toBe('FORBIDDEN');
  });

  /**
   * @tc        TC-ADM01-003-C04
   * @story     US-ADM01-003
   * @ac        AC-US003-04
   * @contract  API-USR-04
   * @subtask   ST-ADM01-003-BE-01
   * In plain words: change answers 200 and renames the code before the first sign-in; 422 EMPLOYEE_CODE_READ_ONLY after it; 409 for a used code or e-mail; 404; 403.
   */
  it('changes a user and answers 422, 409, 404 and 403', async () => {
    const put = (who: string, path: string, payload: object) => http().put(`/api/v1/users/${path}`).set(as(who)).send(payload);
    await create('admin', body('U1')).expect(201);
    await create('admin', body('U2')).expect(201);
    const done = await put('admin', code('U1'), { ...body('U1', { fullName: 'Renamed' }), newEmployeeCode: code('U9') }).expect(200);
    expect(done.body.data).toMatchObject({ employeeCode: code('U9'), name: 'Renamed', status: 'ACTIVE' });
    expect(await prisma.raw.user.count({ where: { employeeCode: code('U1') } })).toBe(0);
    await prisma.raw.user.update({ where: { employeeCode: code('U2') }, data: { firstSignInAt: new Date('2026-05-01') } });
    const locked = await put('admin', code('U2'), { ...body('U2'), newEmployeeCode: code('U8') }).expect(422);
    expect(locked.body.error.code).toBe('EMPLOYEE_CODE_READ_ONLY');
    expect((await put('admin', code('U9'), { ...body('U9'), email: body('U2').email }).expect(409)).body.error.code).toBe('DUPLICATE_EMAIL');
    expect((await put('admin', code('U9'), { ...body('U9'), newEmployeeCode: code('U2') }).expect(409)).body.error.code).toBe('DUPLICATE_EMPLOYEE_CODE');
    expect((await put('admin', '99999', body('U9', { employeeCode: '99999' })).expect(404)).body.error.code).toBe('USER_NOT_FOUND');
    expect((await put('plain', code('U9'), body('U9')).expect(403)).body.error.code).toBe('FORBIDDEN');
  });
});
