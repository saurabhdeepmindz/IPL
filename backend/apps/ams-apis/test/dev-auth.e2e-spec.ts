/**
 * @file    dev-auth.e2e-spec.ts
 * @module  AmsApis
 *
 * @description
 * Supporting tests of ST-ADM01-000-BE-06, written before the code.
 * In plain words: a seeded user can sign in during development and get a token; an unknown user cannot; the refresh token stays out of the body; and in production the route does not exist.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-06
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@libs/database';
import { AmsApisModule } from '@app/ams-apis/module';
import { DevAuthModule } from '@app/ams-apis/dev-auth/dev-auth.module';

const stamp = Date.now().toString(36).slice(-5);

async function startApp(): Promise<INestApplication> {
  process.env.APP_ENV = 'test';
  const ref = await Test.createTestingModule({ imports: [AmsApisModule] }).compile();
  const app = ref.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}

describe('ST-ADM01-000-BE-06 development sign-in', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;
  const employeeCode = stamp;
  const loneCode = `L${stamp.slice(0, 4)}`;

  beforeAll(async () => {
    app = await startApp();
    prisma = app.get(PrismaService);
    const company = await prisma.raw.company.upsert({ where: { code: 'IPL' }, update: {}, create: { code: 'IPL', name: 'Indian Potash Limited' } });
    const role = await prisma.raw.role.upsert({ where: { code: 'INITIATOR' }, update: {}, create: { code: 'INITIATOR', name: 'Initiator', description: 'i', type: 'STANDARD', status: 'ACTIVE' } });
    userId = (await prisma.raw.user.create({ data: { employeeCode, fullName: 'Dev User', email: `d${stamp}@example.invalid` } })).id;
    await prisma.raw.user.create({ data: { employeeCode: loneCode, fullName: 'No Role', email: `n${stamp}@example.invalid` } });
    await prisma.raw.userCompanyRole.create({ data: { userId, roleId: role.id, companyCode: company.code, validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
  });

  afterAll(async () => {
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId } });
    await prisma.raw.user.deleteMany({ where: { employeeCode: { in: [employeeCode, loneCode] } } });
    await app.close();
  });

  it('a seeded user gets a token whose claims fill the session user', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/dev/sign-in').send({ employeeCode, companyCode: 'IPL' }).expect(201);
    const token: string = res.body.data.accessToken;
    expect(token).toBeTruthy();
    const me = await request(app.getHttpServer()).get('/api/v1/dev/whoami').set('Authorization', `Bearer ${token}`).expect(200);
    expect(me.body.data).toMatchObject({ userId, employeeCode, companyCode: 'IPL', departmentId: null });
  });

  it('an unknown user gets 401', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/dev/sign-in').send({ employeeCode: '00000', companyCode: 'IPL' }).expect(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('a user with no role in the company gets 401', async () => {
    await request(app.getHttpServer()).post('/api/v1/dev/sign-in').send({ employeeCode: loneCode, companyCode: 'IPL' }).expect(401);
  });

  it('a request with no token or a bad token gets 401', async () => {
    await request(app.getHttpServer()).get('/api/v1/dev/whoami').expect(401);
    await request(app.getHttpServer()).get('/api/v1/dev/whoami').set('Authorization', 'Bearer not.a.token').expect(401);
  });

  it('the refresh token is a cookie (HTTP-only, same-site) and not in the body', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/dev/sign-in').send({ employeeCode, companyCode: 'IPL' }).expect(201);
    expect(JSON.stringify(res.body)).not.toMatch(/refresh/i);
    const cookie = String(([] as string[]).concat(res.headers['set-cookie'] ?? []).find((c) => c.startsWith('ams_refresh=')));
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=(Lax|Strict)/i);
    const marker = ([] as string[]).concat(res.headers['set-cookie'] ?? []).find((c) => c.startsWith('ams_session='));
    expect(marker).toBeDefined();
    expect(marker).not.toMatch(/HttpOnly/i);
  });

  it('with APP_ENV=prod the route does not exist', async () => {
    const ref = await Test.createTestingModule({ imports: [DevAuthModule.register('prod')] }).compile();
    const prod = ref.createNestApplication();
    prod.setGlobalPrefix('api/v1');
    await prod.init();
    await request(prod.getHttpServer()).post('/api/v1/dev/sign-in').send({ employeeCode, companyCode: 'IPL' }).expect(404);
    await prod.close();
  });
});
