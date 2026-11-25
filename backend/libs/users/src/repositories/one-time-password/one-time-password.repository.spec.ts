/**
 * @file    one-time-password.repository.spec.ts
 * @module  UsersModule
 *
 * @description
 * Supporting tests of the one-time password repository (Jest, real PostgreSQL). Written before the code (TDD). They have no test-case ID of their own (decision ST-02); they carry AC-US007-03. In plain words: shows that a new one-time password stops the earlier ones and that the newest unused one can be read.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/one-time-password/one-time-password.repository.spec.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { UsersModule } from '../../module';
import { OneTimePasswordRepository } from './contract';

const stamp = Date.now().toString(36).slice(-6);

describe('OneTimePasswordRepository (supporting tests, ST-ADM01-007-BE-04)', () => {
  let prisma: PrismaService;
  let repo: OneTimePasswordRepository;
  const userIds: string[] = [];

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, UsersModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(OneTimePasswordRepository);
    for (const n of [1, 2]) {
      userIds.push((await prisma.raw.user.create({ data: { employeeCode: `${stamp.slice(0, 3)}O${n}`, fullName: `Otp ${n}`, email: `otp${n}${stamp}@example.invalid` } })).id);
    }
  });

  afterAll(async () => {
    await prisma.raw.oneTimePassword.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.raw.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-03
   * @subtask ST-ADM01-007-BE-04
   * In plain words: supporting test. A user with no one-time password has none to read.
   */
  it('has no one-time password to read for a new user', async () => {
    expect(await repo.findLatest(userIds[0])).toBeNull();
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-03
   * @subtask ST-ADM01-007-BE-04
   * In plain words: supporting test. Replace stores the new hash as the newest, and the earlier unused passwords are marked used, so only one can be read.
   */
  it('stops the earlier passwords and keeps only the newest', async () => {
    await repo.replace(userIds[0], 'hash-one');
    await repo.replace(userIds[0], 'hash-two');
    const latest = await repo.findLatest(userIds[0]);
    expect(latest?.hash).toBe('hash-two');
    expect(latest?.issuedAt).toBeInstanceOf(Date);
    const rows = await prisma.raw.oneTimePassword.findMany({ where: { userId: userIds[0] }, orderBy: { issuedAt: 'asc' } });
    expect(rows.map((r) => [r.hash, r.usedAt !== null])).toEqual([['hash-one', true], ['hash-two', false]]);
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-03
   * @subtask ST-ADM01-007-BE-04
   * In plain words: supporting test. One user's new password does not touch another user's.
   */
  it('does not touch the passwords of another user', async () => {
    await repo.replace(userIds[1], 'other-hash');
    await repo.replace(userIds[0], 'hash-three');
    expect((await repo.findLatest(userIds[1]))?.hash).toBe('other-hash');
    expect((await repo.findLatest(userIds[0]))?.hash).toBe('hash-three');
  });
});
