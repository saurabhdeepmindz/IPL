/**
 * @file    local-sign-in.service.ts
 * @module  AuthCoreModule
 *
 * @description
 * Password sign-in. In plain words: checks the code and password, counts failures, locks and unlocks by time, and starts the session.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001
 * @subtask        ST-LGN01-001-BE-02
 * @contract       API-AUTH-01
 * @lld            LLD-EPIC-LGN-01 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/local-sign-in.service.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PasswordHasher, UserRepository, UserWriteRepository } from '@libs/users';
import { MAX_FAILED_ATTEMPTS } from './account-lock.policy';
import { RateLimiterService } from '@libs/security';
import { SettingsService } from '@libs/settings';
import { AccountLockPolicy } from './account-lock.policy';
import { SessionService } from './session.service';
import { SignInAuditWriter } from './sign-in-audit.writer';
import { SignInResult } from './sign-in.types';
import { AccountInactiveException, AccountLockedException, InvalidCredentialsException, RateLimitedException } from './errors/auth-errors';


/**
 * LocalSignInService.
 *
 * In plain words: the password sign-in rules
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-001
   *   workflows: UF-01
   *   frd:       FR-039.1, FR-039.2, FR-039.4, FR-039.5
   *   contracts: API-AUTH-01
   *   ac:        AC-US-LGN01-001-01, AC-US-LGN01-001-02, AC-US-LGN01-001-03, AC-US-LGN01-001-04, AC-US-LGN01-001-05, AC-US-LGN01-001-06, AC-US-LGN01-001-07
   *   lld:       LLD-EPIC-LGN-01 v0.3 section 6.1
 */
@Injectable()
export class LocalSignInService {
  constructor(
    private readonly rates: RateLimiterService,
    private readonly users: UserRepository,
    private readonly writes: UserWriteRepository,
    private readonly hasher: PasswordHasher,
    private readonly lock: AccountLockPolicy,
    private readonly sessions: SessionService,
    private readonly audit: SignInAuditWriter,
    private readonly settings: SettingsService,
  ) {}

  /**
   * signIn.
   *
   * In plain words: signs a user in or refuses
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-001
   * @subtask   ST-LGN01-001-BE-02
   * @frd       FR-039.1, FR-039.2, FR-039.4, FR-039.5
   * @workflow  UF-01
   * @contract  API-AUTH-01
   * @ac        AC-US-LGN01-001-01, AC-US-LGN01-001-02, AC-US-LGN01-001-03, AC-US-LGN01-001-04, AC-US-LGN01-001-05, AC-US-LGN01-001-06, AC-US-LGN01-001-07
   * @lld       LLD-EPIC-LGN-01 v0.3 §6.1
   * @status    built
   *
   * @dependencies RateLimiterService.hit, UserRepository.findByCode, PasswordHasher.compare, AccountLockPolicy, UserWriteRepository.recordFailedAttempt, SessionService.create, SignInAuditWriter.record
   *
   * @returns Promise<SignInResult>
   * @throws InvalidCredentialsException, AccountLockedException, AccountInactiveException, RateLimitedException
   */
  async signIn(dto: { employeeCode: string; password: string }, address: string): Promise<SignInResult> {
    const code = dto.employeeCode;
    const window = this.settings.getNumber('signin.windowSeconds');
    for (const [key, limit] of [[`signin:addr:${address}`, this.settings.getNumber('signin.limitPerAddress')], [`signin:emp:${code}`, this.settings.getNumber('signin.limitPerCode')]] as const) {
      const hit = await this.rates.hit(key, limit, window);
      if (!hit.allowed) {
        await this.audit.record({ kind: 'LOCAL', employeeCode: code, result: 'RATE_LIMITED', address });
        throw new RateLimitedException(hit.retryAfterSeconds);
      }
    }
    const now = new Date();
    const user = await this.users.findCredentials(code);
    if (!user) {
      await this.hasher.hash(dto.password); // same work as a real check, so the time does not tell a wrong code from a wrong password
      await this.audit.record({ kind: 'LOCAL', employeeCode: code, result: 'INVALID_CREDENTIALS', address });
      throw new InvalidCredentialsException(MAX_FAILED_ATTEMPTS - 1);
    }
    if (user.status === 'INACTIVE') {
      const reference = await this.audit.record({ kind: 'LOCAL', employeeCode: code, result: 'INACTIVE', address, userId: user.id });
      throw new AccountInactiveException(reference);
    }
    if (this.lock.isLocked(user, now)) {
      const reference = await this.audit.record({ kind: 'LOCAL', employeeCode: code, result: 'LOCKED', address, userId: user.id });
      throw new AccountLockedException(user.lockedUntil as Date, reference);
    }
    const matches = user.passwordHash ? await this.hasher.verify(dto.password, user.passwordHash) : false;
    if (!matches) {
      const next = this.lock.afterFailure(user.failedAttempts, now);
      await this.writes.recordFailedAttempt(user.id, next.failedAttempts, next.lockedUntil);
      if (next.lockedUntil) {
        const reference = await this.audit.record({ kind: 'LOCAL', employeeCode: code, result: 'LOCKED', address, userId: user.id });
        throw new AccountLockedException(next.lockedUntil, reference);
      }
      await this.audit.record({ kind: 'LOCAL', employeeCode: code, result: 'INVALID_CREDENTIALS', address, userId: user.id });
      throw new InvalidCredentialsException(next.attemptsLeft);
    }
    await this.writes.clearFailures(user.id);
    await this.writes.setSignInTimes(user.id, now);
    const session = await this.sessions.create({ id: user.id, employeeCode: user.employeeCode, fullName: user.fullName, departmentId: user.departmentId });
    await this.audit.record({ kind: 'LOCAL', employeeCode: code, result: 'SUCCESS', address, userId: user.id });
    return { ...session, nextStep: user.mustChangePassword ? 'CHANGE_PASSWORD' : 'CHOOSE_WORK', user: { employeeCode: user.employeeCode, name: user.fullName } };
  }
}
