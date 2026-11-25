/**
 * @file    otp.fakes.ts
 * @module  UsersModule
 *
 * @description
 * Test helpers of the one-time password and lifecycle service specs. In plain words: in-memory stand-ins for the one-time password repository, the write side of the user repository, the mailer and the hasher, and the users they use.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-05
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/otp.fakes.ts
 * @lld-synced     v0.28
 * @status         built
 */

import { UserStatus } from '@libs/database';
import { UserRecord } from '../repositories/user';
import { userRecord } from './users.fakes';

/** The hasher: "hashes" by adding a prefix, so a test can tell a hash from the password. */
export class FakeHasher {
  async hash(plain: string): Promise<string> {
    return `H:${plain}`;
  }
}

/** The one-time password repository, in memory. */
export class FakeOtpRepo {
  replaced: Array<{ userId: string; hash: string }> = [];
  async replace(userId: string, hash: string): Promise<void> {
    this.replaced.push({ userId, hash });
  }
}

/** The write side of the user repository, in memory. */
export class FakeWrites {
  mustChange: Array<{ userId: string; value: boolean }> = [];
  statuses: Array<{ userId: string; status: UserStatus; extra?: object }> = [];
  async setMustChangePassword(userId: string, value: boolean): Promise<void> {
    this.mustChange.push({ userId, value });
  }
  async setStatus(userId: string, status: UserStatus, extra?: object): Promise<void> {
    this.statuses.push({ userId, status, extra });
  }
}

/** The mailer: remembers what it was asked to send and answers as told. */
export class FakeMailer {
  answer: 'SENT' | 'FAILED' | 'THROW' = 'SENT';
  sent: Array<{ to: { email: string; fullName: string }; password: string }> = [];
  async send(to: { email: string; fullName: string }, password: string): Promise<'SENT' | 'FAILED'> {
    this.sent.push({ to, password });
    if (this.answer === 'THROW') throw new Error('smtp down');
    return this.answer;
  }
}

/** The one-time password service as the lifecycle service sees it. */
export class FakeOtpService {
  issued: Array<{ id: string; email: string; fullName: string }> = [];
  answer: 'SENT' | 'FAILED' = 'SENT';
  async issue(user: { id: string; email: string; fullName: string }): Promise<'SENT' | 'FAILED'> {
    this.issued.push(user);
    return this.answer;
  }
}

/** The read side of the user repository with a few users by employee code. */
export class FakeUsers {
  users: Record<string, UserRecord> = {
    '10021': userRecord({ employeeCode: '10021', id: 'u-local', authType: 'LOCAL', email: 'local@example.invalid' }),
    '10022': userRecord({ employeeCode: '10022', id: 'u-sso', authType: 'SSO' }),
    '10023': userRecord({ employeeCode: '10023', id: 'u-locked', authType: 'LOCAL', status: 'LOCKED' }),
    '10024': userRecord({ employeeCode: '10024', id: 'u-signed', authType: 'LOCAL', firstSignInAt: new Date('2026-05-01') }),
    '10025': userRecord({ employeeCode: '10025', id: 'u-off', authType: 'LOCAL', status: 'INACTIVE' }),
  };
  async findByCode(code: string): Promise<UserRecord | null> {
    return this.users[code] ?? null;
  }
}
