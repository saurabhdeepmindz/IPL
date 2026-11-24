/**
 * @file    audit.service.spec.ts
 * @module  AuditModule
 *
 * @description
 * Supporting tests of ST-ADM01-000-BE-03, written before the code. In plain words: a change writes one row with before, after, actor and reason; a refusal writes one row; secrets never reach the row; a failing write never breaks a refusal.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-03
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { AuditModule } from '../module';
import { AuditLogRepository } from '../repositories/audit-log/contract';
import { AuditService, stripSecrets } from './audit.service';

const stamp = Date.now().toString(36);

describe('ST-ADM01-000-BE-03 AuditService', () => {
  let prisma: PrismaService;
  let audit: AuditService;

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, AuditModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    audit = ref.get(AuditService);
  });

  afterAll(async () => {
    await prisma.raw.auditLog.deleteMany({ where: { actor: { startsWith: `t-${stamp}` } } });
    await prisma.onModuleDestroy();
  });

  it('a change writes one row with before, after, actor and reason', async () => {
    await audit.recordChange({
      actor: `t-${stamp}-a`, companyCode: 'IPL', entity: 'User', entityKey: 'k1',
      before: { fullName: 'Old' }, after: { fullName: 'New' }, reason: 'typo',
    });
    const rows = await prisma.raw.auditLog.findMany({ where: { actor: `t-${stamp}-a` } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: 'CHANGE', entity: 'User', entityKey: 'k1', reason: 'typo', before: { fullName: 'Old' }, after: { fullName: 'New' } });
  });

  it('a refusal writes one row with user, company, permission key and code', async () => {
    await audit.recordRefusal({ userId: `t-${stamp}-b`, companyCode: 'IPL', permissionKey: 'users.manage', code: 'FORBIDDEN' });
    const rows = await prisma.raw.auditLog.findMany({ where: { actor: `t-${stamp}-b` } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: 'REFUSAL', companyCode: 'IPL', permissionKey: 'users.manage', code: 'FORBIDDEN' });
  });

  it('no password, token or one-time password reaches the row', async () => {
    await audit.recordChange({
      actor: `t-${stamp}-c`, entity: 'User', entityKey: 'k2',
      after: { fullName: 'X', password: 'p1', nested: { token: 't1', otp: '123456', keep: 'ok' }, list: [{ passwordHash: 'h' }] },
    });
    const [row] = await prisma.raw.auditLog.findMany({ where: { actor: `t-${stamp}-c` } });
    const text = JSON.stringify(row.after);
    expect(text).not.toMatch(/p1|t1|123456|"h"/);
    expect(text).toContain('keep');
  });

  it('stripSecrets masks by field name at any depth', () => {
    expect(stripSecrets({ a: { password: 'x' }, b: [{ token: 'y' }] })).toEqual({ a: { password: '[removed]' }, b: [{ token: '[removed]' }] });
  });

  it('a refusal never throws when the write fails', async () => {
    const broken = new AuditService({ add: () => Promise.reject(new Error('db down')) } as unknown as AuditLogRepository);
    await expect(broken.recordRefusal({ userId: 'u', companyCode: 'IPL', permissionKey: 'k', code: 'FORBIDDEN' })).resolves.toBeUndefined();
  });

  it('a change write failure goes to the caller', async () => {
    const broken = new AuditService({ add: () => Promise.reject(new Error('db down')) } as unknown as AuditLogRepository);
    await expect(broken.recordChange({ actor: 'u', entity: 'User', entityKey: 'k' })).rejects.toThrow('db down');
  });
});
