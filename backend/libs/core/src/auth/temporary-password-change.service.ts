/**
 * @file    temporary-password-change.service.ts
 * @module  AuthCoreModule
 *
 * @description
 * Temporary password change. In plain words: checks the temporary password, the rules and that the new password differs, then saves it and clears the flag.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-004
 * @subtask        ST-LGN02-004-BE-02
 * @contract       API-PWD-04
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/temporary-password-change.service.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PasswordHasher, UserPasswordWrites, UserRepository, UserWriteRepository } from '@libs/users';
import { AccountLockPolicy, MAX_FAILED_ATTEMPTS } from './account-lock.policy';
import { AccountLockedException, InvalidCredentialsException } from './errors/auth-errors';
import { NotRequiredException, SameAsTemporaryException } from './errors/password-errors';
import { PasswordPolicyService } from './password-policy.service';
import { SessionService } from './session.service';
import { SignInAuditWriter } from './sign-in-audit.writer';
import { SessionTokens } from './sign-in.types';

/** The user of the call, read from the access token. */
export interface PendingUser {
  userId: string;
  employeeCode: string;
  sid?: string;
}

/**
 * TemporaryPasswordChangeService.
 *
 * In plain words: replaces the temporary password the IT team set. A wrong temporary password counts as a failed sign-in (same count and lock).
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-004
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-004-01, AC-US-LGN02-004-02, AC-US-LGN02-004-03
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
@Injectable()
export class TemporaryPasswordChangeService {
  constructor(
    private readonly users: UserRepository,
    private readonly failures: UserWriteRepository,
    private readonly writes: UserPasswordWrites,
    private readonly hasher: PasswordHasher,
    private readonly policy: PasswordPolicyService,
    private readonly lock: AccountLockPolicy,
    private readonly sessions: SessionService,
    private readonly audit: SignInAuditWriter,
  ) {}

  /**
   * Changes the temporary password.
   *
   * In plain words: checks the temporary password, the policy and that the new one differs, saves it, clears the flag and issues a new session without the flag.
   *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-004
 * @subtask   ST-LGN02-004-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-004-01, AC-US-LGN02-004-02, AC-US-LGN02-004-03
 * @lld       LLD-EPIC-LGN-02 v0.3 §6.0
 * @status    built
   *
   * @dependencies UserRepository.findCredentials, PasswordHasher.verify, PasswordPolicyService.check, UserPasswordWrites.setPasswordHash, SessionService.create
   *
   * @throws NotRequiredException, InvalidCredentialsException, AccountLockedException, SameAsTemporaryException, PasswordPolicyException, PasswordReusedException
   */
  async change(dto: { temporaryPassword: string; newPassword: string }, user: PendingUser): Promise<{ nextStep: 'CHOOSE_WORK'; session: SessionTokens }> {
    const creds = await this.users.findCredentials(user.employeeCode);
    if (!creds || !creds.mustChangePassword) throw new NotRequiredException();
    if (!creds.passwordHash || !(await this.hasher.verify(dto.temporaryPassword, creds.passwordHash))) await this.refuse(creds);
    if (dto.newPassword === dto.temporaryPassword) throw new SameAsTemporaryException();
    await this.policy.check(creds.id, dto.newPassword);
    const hash = await this.hasher.hash(dto.newPassword);
    await this.writes.setPasswordHash(creds.id, hash, 'bcrypt');
    await this.writes.markOneTimePasswordUsed(creds.id);
    await this.policy.remember(creds.id, hash);
    if (user.sid) await this.sessions.end(user.sid);
    const session = await this.sessions.create({ id: creds.id, employeeCode: creds.employeeCode, fullName: creds.fullName, departmentId: creds.departmentId });
    await this.audit.record({ kind: 'LOCAL', employeeCode: creds.employeeCode, result: 'SUCCESS', userId: creds.id });
    return { nextStep: 'CHOOSE_WORK', session };
  }

  private async refuse(creds: { id: string; employeeCode: string; failedAttempts: number }): Promise<never> {
    const next = this.lock.afterFailure(creds.failedAttempts, new Date());
    await this.failures.recordFailedAttempt(creds.id, next.failedAttempts, next.lockedUntil);
    if (next.lockedUntil) {
      const reference = await this.audit.record({ kind: 'LOCAL', employeeCode: creds.employeeCode, result: 'LOCKED', userId: creds.id });
      throw new AccountLockedException(next.lockedUntil, reference);
    }
    await this.audit.record({ kind: 'LOCAL', employeeCode: creds.employeeCode, result: 'INVALID_CREDENTIALS', userId: creds.id });
    throw new InvalidCredentialsException(next.attemptsLeft ?? MAX_FAILED_ATTEMPTS - 1);
  }
}
