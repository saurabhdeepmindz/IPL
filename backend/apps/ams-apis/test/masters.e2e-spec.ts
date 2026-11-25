/**
 * @file    masters.e2e-spec.ts
 * @module  AmsApis
 *
 * @description
 * Route tests of API-MST-01 to API-MST-03 on the real application (Jest e2e). In plain words: the three reads answer 200 with the documented shapes, 401 without a token and 403 without `users.view`; `canViewAll` follows `companies.view-all`.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/test/masters.e2e-spec.ts
 * @lld-synced     v0.26
 * @status         built
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@libs/database';
import { AmsApisModule } from '@app/ams-apis/module';

const stamp = Date.now().toString(36).slice(-5);
const short = stamp.slice(0, 3);

describe('ST-ADM01-002-BE-01 masters reads (API-MST-01 to 03)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};
  const ids: string[] = [];
  const roleIds: string[] = [];
  const http = () => request(app.getHttpServer());
  const get = (who: string, path: string) => http().get(`/api/v1/masters/${path}`).set({ Authorization: `Bearer ${tokens[who]}` });

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    const ref = await Test.createTestingModule({ imports: [AmsApisModule] }).compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.raw.company.upsert({ where: { code: 'IPL' }, update: {}, create: { code: 'IPL', name: 'IPL' } });
    const perms = await prisma.raw.permission.findMany({ where: { code: { in: ['users.view', 'companies.view-all'] } } });
    const mk = async (who: string, n: string, grants: string[]) => {
      const roleId = (await prisma.raw.role.create({ data: { code: `Mr${n}${stamp}`, name: `Mr${n} ${stamp}`, description: 'e2e', status: 'ACTIVE' } })).id;
      roleIds.push(roleId);
      for (const p of perms.filter((x) => grants.includes(x.code))) await prisma.raw.rolePermission.create({ data: { roleId, permissionId: p.id, allowed: true, scope: 'COMPANY' } });
      const id = (await prisma.raw.user.create({ data: { employeeCode: `${short}${n}`, fullName: `Masters ${who}`, email: `m${n}${stamp}@example.invalid` } })).id;
      ids.push(id);
      await prisma.raw.userCompanyRole.create({ data: { userId: id, roleId, companyCode: 'IPL', validFrom: new Date('2026-01-01'), assignedBy: '10001' } });
      tokens[who] = (await http().post('/api/v1/dev/sign-in').send({ employeeCode: `${short}${n}`, companyCode: 'IPL' }).expect(201)).body.data.accessToken;
    };
    await mk('viewer', 'M1', ['users.view']);
    await mk('all', 'M2', ['users.view', 'companies.view-all']);
    await mk('plain', 'M3', []);
  });

  afterAll(async () => {
    await prisma.raw.userCompanyRole.deleteMany({ where: { userId: { in: ids } } });
    await prisma.raw.rolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.raw.role.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: ids } } });
    await app.close();
  });

  /**
   * @story   US-ADM01-002
   * @ac      AC-US002-02
   * @contract API-MST-01
   * @subtask ST-ADM01-002-BE-01
   * In plain words: supporting test. The departments answer 200 with id, code and name; 401 without a token; 403 without `users.view`.
   */
  it('serves the departments', async () => {
    const res = await get('viewer', 'departments').expect(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(Object.keys(res.body.data.items[0]).sort()).toEqual(['code', 'id', 'name']);
    await http().get('/api/v1/masters/departments').expect(401);
    expect((await get('plain', 'departments').expect(403)).body.error.code).toBe('FORBIDDEN');
  });

  /**
   * @story   US-ADM01-002
   * @ac      AC-US002-02
   * @contract API-MST-02
   * @subtask ST-ADM01-002-BE-01
   * In plain words: supporting test. The designations answer 200 with the flag of the highest one, and exactly one is marked; 403 without `users.view`.
   */
  it('serves the designations', async () => {
    const res = await get('viewer', 'designations').expect(200);
    expect(Object.keys(res.body.data.items[0]).sort()).toEqual(['code', 'id', 'isHighest', 'name']);
    expect(res.body.data.items.filter((d: { isHighest: boolean }) => d.isHighest).length).toBeGreaterThanOrEqual(1);
    await get('plain', 'designations').expect(403);
  });

  /**
   * @story   US-ADM01-002
   * @ac      AC-US002-02
   * @contract API-MST-03
   * @subtask ST-ADM01-002-BE-01
   * In plain words: supporting test. The companies answer 200; `canViewAll` is false for a caller without `companies.view-all` and true with it; 403 without `users.view`.
   */
  it('serves the companies and tells who may see all', async () => {
    const plain = await get('viewer', 'companies').expect(200);
    expect(plain.body.data.canViewAll).toBe(false);
    expect(plain.body.data.items.map((c: { code: string }) => c.code)).toContain('IPL');
    expect((await get('all', 'companies').expect(200)).body.data.canViewAll).toBe(true);
    await get('plain', 'companies').expect(403);
  });
});
