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

  /**
   * @story   US-ADM01-014
   * @ac      AC-US014-03
   * @subtask ST-ADM01-014-BE-03
   * In plain words: supporting test. A change returns the id of the audit row it wrote, so a caller can hand it back (auditId).
   */
  it('a change returns the id of the row it wrote', async () => {
    const id = await audit.recordChange({ actor: `t-${stamp}-d`, entity: 'User', entityKey: 'k3', reason: 'id check' });
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    const row = await prisma.raw.auditLog.findUnique({ where: { id } });
    expect(row).toMatchObject({ actor: `t-${stamp}-d`, reason: 'id check' });
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

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-03
   * @subtask ST-ADM01-003-BE-02
   * In plain words: supporting test. The latest changes of one record come back newest first, only for that record, and at most as many as asked (the user details show up to 10).
   */
  it('returns the latest changes of one record, newest first, limited', async () => {
    const key = `rc-${stamp}`;
    for (let i = 1; i <= 12; i += 1) await audit.recordChange({ actor: `t-${stamp}-r`, entity: 'User', entityKey: key, reason: `change ${i}` });
    await audit.recordChange({ actor: `t-${stamp}-r`, entity: 'User', entityKey: `${key}-other`, reason: 'other user' });
    const latest = await audit.recentChanges('User', key, 10);
    expect(latest).toHaveLength(10);
    expect(latest[0].text).toBe('change 12');
    expect(latest[9].text).toBe('change 3');
    expect(latest.every((l) => l.at instanceof Date)).toBe(true);
    expect(await audit.recentChanges('User', `${key}-none`, 10)).toEqual([]);
    await prisma.raw.auditLog.deleteMany({ where: { entityKey: { startsWith: key } } });
  });
});
