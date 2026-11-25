/**
 * @file    users-lifecycle.e2e-spec.ts
 * @module  AmsApis
 *
 * @description
 * Route tests of API-USR-06 to API-USR-08 on the real application (Jest e2e, real PostgreSQL and Redis). Written before the controller (TDD). In plain words: calls unlock, reset password and send the one-time password again with a signed-in Administrator and checks the status, the error code and the body. The deactivate route (C05) is tested in `users-deactivate.e2e-spec.ts`.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005, US-ADM01-007
 * @subtask        ST-ADM01-005-BE-01, ST-ADM01-007-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/test/users-lifecycle.e2e-spec.ts
 * @lld-synced     v0.20
 * @status         built
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@libs/database';
import { AmsApisModule } from '@app/ams-apis/module';

const stamp = Date.now().toString(36).slice(-5);
const short = stamp.slice(0, 3);

describe('ST-ADM01-007-BE-01 user life routes (C06 to C08)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};
  const ids: Record<string, string> = {};
  const roleIds: string[] = [];
  const code = (n: string) => `${short}${n}`;
  const http = () => request(app.getHttpServer());
  const post = (who: string, path: string) => http().post(`/api/v1/users/${path}`).set({ Authorization: `Bearer ${tokens[who]}` });

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    const ref = await Test.createTestingModule({ imports: [AmsApisModule] }).compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.raw.company.upsert({ where: { code: 'IPL' }, update: {}, create: { code: 'IPL', name: 'IPL' } });
    const manage = await prisma.raw.permission.findUniqueOrThrow({ where: { code: 'users.manage' } });
    const mkRole = async (n: string, grant: boolean) => {
      const id = (await prisma.raw.role.create({ data: { code: `Ul${n}${stamp}`, name: `Ul${n} ${stamp}`, description: 'e2e', status: 'ACTIVE' } })).id;
      roleIds.push(id);
      if (grant) await prisma.raw.rolePermission.create({ data: { roleId: id, permissionId: manage.id, allowed: true, scope: 'COMPANY' } });
      return id;
    };
    const admin = await mkRole('a', true);
    const plain = await mkRole('p', false);
    const mk = async (who: string, n: string, roleId: string, data: object = {}) => {
      ids[who] = (await prisma.raw.user.create({ data: { employeeCode: code(n), fullName: `Life ${who}`, email: `${who}${stamp}@example.invalid`, ...data } })).id;
      await prisma.raw.userCompanyRole.create({ data: { userId: ids[who], roleId, companyCode: 'IPL', validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
    };
    await mk('admin', 'M1', admin);
    await mk('plain', 'M2', plain);
    await mk('local', 'L1', plain, { authType: 'LOCAL' });
    await mk('sso', 'S1', plain, { authType: 'SSO' });
    await mk('locked', 'K1', plain, { authType: 'LOCAL', status: 'LOCKED', failedAttempts: 5, lockedUntil: new Date(Date.now() + 600000) });
    await mk('signed', 'G1', plain, { authType: 'LOCAL', firstSignInAt: new Date('2026-05-01') });
    await mk('off', 'F1', plain, { authType: 'LOCAL', status: 'INACTIVE' });
    for (const [who, c] of [['admin', 'M1'], ['plain', 'M2']]) tokens[who] = (await http().post('/api/v1/dev/sign-in').send({ employeeCode: code(c), companyCode: 'IPL' }).expect(201)).body.data.accessToken;
  });

  afterAll(async () => {
    const all = Object.values(ids);
    await prisma.raw.auditLog.deleteMany({ where: { entity: 'User', entityKey: { in: all } } });
    await prisma.raw.oneTimePassword.deleteMany({ where: { userId: { in: all } } });
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: all } } });
    await prisma.raw.rolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: all } } });
    await app.close();
  });

  /**
   * @tc        TC-ADM01-007-C06
   * @story     US-ADM01-007
   * @ac        AC-US007-01
   * @contract  API-USR-06
   * @subtask   ST-ADM01-007-BE-01
   * In plain words: unlock answers 200 and clears the lock; 409 NOT_LOCKED when the user is not locked; 404; 401; 403.
   */
  it('unlocks a user and answers 409, 404, 401 and 403', async () => {
    const done = await post('admin', `${code('K1')}/unlock`).expect(200);
    expect(done.body.data).toEqual({ status: 'ACTIVE' });
    expect(await prisma.raw.user.findUniqueOrThrow({ where: { id: ids.locked } })).toMatchObject({ status: 'ACTIVE', failedAttempts: 0, lockedUntil: null });
    expect((await post('admin', `${code('K1')}/unlock`).expect(409)).body.error.code).toBe('NOT_LOCKED');
    expect((await post('admin', '99999/unlock').expect(404)).body.error.code).toBe('USER_NOT_FOUND');
    await http().post(`/api/v1/users/${code('K1')}/unlock`).expect(401);
    expect((await post('plain', `${code('K1')}/unlock`).expect(403)).body.error.code).toBe('FORBIDDEN');
  });

  /**
   * @tc        TC-ADM01-007-C07
   * @story     US-ADM01-007
   * @ac        AC-US007-02
   * @contract  API-USR-07
   * @subtask   ST-ADM01-007-BE-01
   * In plain words: reset answers 200 with the e-mail status and a new password is stored; 422 for an SSO user; 409 for an Inactive user; 404.
   */
  it('resets a password and answers 422, 409 and 404', async () => {
    const done = await post('admin', `${code('L1')}/reset-password`).expect(200);
    expect(done.body.data).toEqual({ emailStatus: 'SENT' });
    expect(await prisma.raw.oneTimePassword.count({ where: { userId: ids.local, usedAt: null } })).toBe(1);
    expect(await prisma.raw.user.findUniqueOrThrow({ where: { id: ids.local } })).toMatchObject({ mustChangePassword: true });
    expect((await post('admin', `${code('S1')}/reset-password`).expect(422)).body.error.code).toBe('NOT_LOCAL_USER');
    expect((await post('admin', `${code('F1')}/reset-password`).expect(409)).body.error.code).toBe('USER_INACTIVE');
    expect((await post('admin', '99999/reset-password').expect(404)).body.error.code).toBe('USER_NOT_FOUND');
  });

  /**
   * @tc        TC-ADM01-007-C08
   * @story     US-ADM01-007
   * @ac        AC-US007-03
   * @contract  API-USR-08
   * @subtask   ST-ADM01-007-BE-01
   * In plain words: send-again answers 200; the earlier one-time password stops working; 422 for an SSO user or a user who has signed in; 404.
   */
  it('sends the one-time password again and answers 422 and 404', async () => {
    await post('admin', `${code('L1')}/reset-password`).expect(200);
    const before = await prisma.raw.oneTimePassword.findMany({ where: { userId: ids.local, usedAt: null } });
    const done = await post('admin', `${code('L1')}/one-time-password`).expect(200);
    expect(done.body.data).toEqual({ emailStatus: 'SENT' });
    const unused = await prisma.raw.oneTimePassword.findMany({ where: { userId: ids.local, usedAt: null } });
    expect(unused).toHaveLength(1);
    expect(unused[0].id).not.toBe(before[0].id);
    expect((await post('admin', `${code('S1')}/one-time-password`).expect(422)).body.error.code).toBe('NOT_LOCAL_USER');
    expect((await post('admin', `${code('G1')}/one-time-password`).expect(422)).body.error.code).toBe('ALREADY_SIGNED_IN');
    expect((await post('admin', '99999/one-time-password').expect(404)).body.error.code).toBe('USER_NOT_FOUND');
  });

});
