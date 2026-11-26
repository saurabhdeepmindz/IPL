/**
 * @file    auth.fakes.ts
 * @module  AuthCoreModule
 *
 * @description
 * Test stand-ins for Redis, the user stores and the hasher. In plain words: lets the sign-in tests run without a database.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001
 * @subtask        ST-LGN01-001-BE-04
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/auth.fakes.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { ChangeRecord } from '@libs/audit';

/** An in-memory stand-in for RedisService (same method names). */
export class FakeRedis {
  readonly store = new Map<string, unknown>();
  readonly counters = new Map<string, number>();

  async getJson<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T) ?? null;
  }

  async setJson(key: string, value: unknown): Promise<void> {
    this.store.set(key, JSON.parse(JSON.stringify(value)));
  }

  async takeJson<T>(key: string): Promise<T | null> {
    const v = (this.store.get(key) as T) ?? null;
    this.store.delete(key);
    return v;
  }

  async deleteKey(key: string): Promise<void> {
    this.store.delete(key);
  }

  async increment(key: string, windowSeconds: number): Promise<{ count: number; ttlSeconds: number }> {
    const count = (this.counters.get(key) ?? 0) + 1;
    this.counters.set(key, count);
    return { count, ttlSeconds: windowSeconds };
  }
}

export function fakeAuditService(): { rows: ChangeRecord[]; recordChange: (r: ChangeRecord) => Promise<string> } {
  const rows: ChangeRecord[] = [];
  return {
    rows,
    recordChange: async (r: ChangeRecord) => {
      rows.push(r);
      return 'audit-1';
    },
  };
}

export interface FakeCredentials {
  id: string;
  employeeCode: string;
  fullName: string;
  departmentId: string | null;
  authType: 'SSO' | 'LOCAL';
  passwordHash: string | null;
  mustChangePassword: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  failedAttempts: number;
  lockedUntil: Date | null;
}

export function makeCredentials(over: Partial<FakeCredentials> = {}): FakeCredentials {
  return {
    id: 'u1',
    employeeCode: '10002',
    fullName: 'A. Kumar',
    departmentId: 'd1',
    authType: 'LOCAL',
    passwordHash: 'H:secret-pass',
    mustChangePassword: false,
    status: 'ACTIVE',
    failedAttempts: 0,
    lockedUntil: null,
    ...over,
  };
}

/** Stands in for the user repository and the user-write repository together. */
export class FakeUserStore {
  readonly calls: string[] = [];

  constructor(readonly user: FakeCredentials | null) {}

  async findCredentials(code: string): Promise<FakeCredentials | null> {
    return this.user && this.user.employeeCode === code ? { ...this.user } : null;
  }

  async recordFailedAttempt(_id: string, failedAttempts: number, lockedUntil: Date | null): Promise<void> {
    this.calls.push('fail:' + failedAttempts);
    if (this.user) {
      this.user.failedAttempts = failedAttempts;
      this.user.lockedUntil = lockedUntil;
      if (lockedUntil) this.user.status = 'LOCKED';
    }
  }

  async clearFailures(): Promise<void> {
    this.calls.push('clear');
    if (this.user) {
      this.user.failedAttempts = 0;
      this.user.lockedUntil = null;
      if (this.user.status === 'LOCKED') this.user.status = 'ACTIVE';
    }
  }

  async setSignInTimes(): Promise<void> {
    this.calls.push('times');
  }
}

export class FakeHasher {
  async hash(plain: string): Promise<string> {
    return 'H:' + plain;
  }

  async verify(plain: string, stored: string): Promise<boolean> {
    return stored === 'H:' + plain;
  }
}
