/**
 * @file    user-write.repository.spec.ts
 * @module  UsersModule
 *
 * @description
 * Supporting tests of the user write repository (Jest, real PostgreSQL). Written before the code (TDD). They have no test-case ID of their own (decision ST-02); they carry AC-US007-01 and AC-US007-02. In plain words: shows that unlocking clears the lock and that must-change-password is set and cleared.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-05
 * @lld            LLD-EPIC-ADM-01 v0.15 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.15.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user-write/user-write.repository.spec.ts
 * @lld-synced     v0.15
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { DatabaseModule, PrismaService } from '@libs/database';
import { UsersModule } from '../../module';
import { UserWriteRepository } from './contract';

const stamp = Date.now().toString(36).slice(-6);

describe('UserWriteRepository (supporting tests, ST-ADM01-007-BE-05)', () => {
  let prisma: PrismaService;
  let repo: UserWriteRepository;
  let userId: string;

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [DatabaseModule, UsersModule] }).compile();
    await ref.init();
    prisma = ref.get(PrismaService);
    repo = ref.get(UserWriteRepository);
    userId = (
      await prisma.raw.user.create({
        data: { employeeCode: `${stamp.slice(0, 3)}W1`, fullName: 'Write User', email: `w${stamp}@example.invalid`, status: 'LOCKED', failedAttempts: 5, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
      })
    ).id;
  });

  afterAll(async () => {
    await prisma.raw.user.delete({ where: { id: userId } });
    await prisma.onModuleDestroy();
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-01
   * @subtask ST-ADM01-007-BE-05
   * In plain words: supporting test. Unlocking sets the user Active and clears the lock time and the failed-attempt count.
   */
  it('unlocks a user and clears the lock', async () => {
    await repo.setStatus(userId, 'ACTIVE', { clearLock: true });
    const u = await prisma.raw.user.findUniqueOrThrow({ where: { id: userId } });
    expect(u).toMatchObject({ status: 'ACTIVE', failedAttempts: 0, lockedUntil: null });
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-02
   * @subtask ST-ADM01-007-BE-05
   * In plain words: supporting test. A user with a one-time password must change it at the first sign-in; the flag can be cleared again.
   */
  it('sets and clears must-change-password', async () => {
    await repo.setMustChangePassword(userId, true);
    expect((await prisma.raw.user.findUniqueOrThrow({ where: { id: userId } })).mustChangePassword).toBe(true);
    await repo.setMustChangePassword(userId, false);
    expect((await prisma.raw.user.findUniqueOrThrow({ where: { id: userId } })).mustChangePassword).toBe(false);
  });
});
