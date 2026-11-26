/**
 * @file    password.fakes.ts
 * @module  EPIC-LGN-02
 *
 * @description
 * In-memory stand-ins used by the password specs. In plain words: small fakes so the services can be tested without a database, Redis or a mail server.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-001, US-LGN02-002, US-LGN02-004
 * @subtask        ST-LGN02-001-BE-04
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/password.fakes.ts
 * @lld-synced     v0.3
 * @status         built
 */
import { PasswordResetTokenRepository, ResetTokenOwner } from './repositories/password-reset-token/contract';
import { PasswordHistoryRepository } from './repositories/password-history/contract';

export class FakeTokens extends PasswordResetTokenRepository {
  rows: { userId: string; tokenHash: string; issuedAt: Date; usedAt: Date | null; replacedAt: Date | null }[] = [];
  owners: Record<string, ResetTokenOwner> = { u1: { userId: 'u1', employeeCode: '10002', email: 'a.kumar@ipl.example', fullName: 'A. Kumar' } };
  async issue(userId: string, tokenHash: string): Promise<void> {
    this.rows.filter((r) => r.userId === userId && !r.usedAt && !r.replacedAt).forEach((r) => (r.replacedAt = new Date()));
    this.rows.push({ userId, tokenHash, issuedAt: new Date(), usedAt: null, replacedAt: null });
  }
  async findValid(tokenHash: string, now: Date, maxAgeMinutes: number): Promise<ResetTokenOwner | null> {
    const r = this.rows.find((x) => x.tokenHash === tokenHash);
    if (!r || r.usedAt || r.replacedAt || now.getTime() - r.issuedAt.getTime() > maxAgeMinutes * 60000) return null;
    return this.owners[r.userId] ?? null;
  }
  async markUsed(tokenHash: string): Promise<boolean> {
    const r = this.rows.find((x) => x.tokenHash === tokenHash && !x.usedAt);
    if (!r) return false;
    r.usedAt = new Date();
    return true;
  }
}

export class FakeHistoryRepo extends PasswordHistoryRepository {
  rows: string[] = [];
  async lastHashes(_u: string, count: number): Promise<string[]> {
    return this.rows.slice(0, count);
  }
  async add(_u: string, hash: string): Promise<void> {
    this.rows.unshift(hash);
  }
  async trim(_u: string, keep: number): Promise<void> {
    this.rows = this.rows.slice(0, keep);
  }
}

/** A rate limiter that counts like the real one (per key). */
export class FakeRates {
  counts = new Map<string, number>();
  async hit(key: string, limit: number, window: number): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
    const n = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, n);
    return { allowed: n <= limit, retryAfterSeconds: window };
  }
}

export class FakeMailman {
  sent: { to: string; name: string; data: Record<string, string> }[] = [];
  async send(to: string, name: string, data: Record<string, string>): Promise<void> {
    this.sent.push({ to, name, data });
  }
}

export class FakeAudit {
  rows: unknown[] = [];
  async recordChange(r: unknown): Promise<string> {
    this.rows.push(r);
    return 'a1';
  }
}

export class FakePasswordWrites {
  calls: string[] = [];
  hash: string | null = null;
  async setPasswordHash(_u: string, hash: string): Promise<void> {
    this.calls.push('hash');
    this.hash = hash;
  }
  async markOneTimePasswordUsed(): Promise<void> {
    this.calls.push('otp-used');
  }
  async recordFailedAttempt(_u: string, n: number): Promise<void> {
    this.calls.push('fail:' + n);
  }
}
