/**
 * @file    users-lifecycle.service.ts
 * @module  UsersModule
 *
 * @description
 * Life of a user. In plain words: deactivates a leaver (with a warning about held proposals), unlocks a locked user, and resets or re-sends a one-time password.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005, US-ADM01-007
 * @subtask        ST-ADM01-005-BE-02, ST-ADM01-007-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/users-lifecycle.service.ts
 * @lld-synced     v0.28
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { AuditService } from '@libs/audit';
import { AlreadyInactiveException } from '../errors/already-inactive.exception';
import { AlreadySignedInException } from '../errors/already-signed-in.exception';
import { HoldsProposalsException } from '../errors/holds-proposals.exception';
import { LastAdministratorException } from '../errors/last-administrator.exception';
import { NotLocalUserException } from '../errors/not-local-user.exception';
import { NotLockedException } from '../errors/not-locked.exception';
import { UnknownUserException } from '../errors/unknown-user.exception';
import { UserInactiveException } from '../errors/user-inactive.exception';
import { DelegationPort } from '../ports/delegation.port';
import { SessionRevocationPort } from '../ports/session-revocation.port';
import { WorkflowPort } from '../ports/workflow.port';
import { UserRecord, UserRepository } from '../repositories/user';
import { UserWriteRepository } from '../repositories/user-write';
import { OneTimePasswordService } from './one-time-password.service';

/** Why a user is deactivated (the five values of the screen). */
export type DeactivationReason = 'LEFT_COMPANY' | 'TRANSFERRED' | 'LONG_LEAVE' | 'DUPLICATE' | 'OTHER';

/**
 * Users lifecycle service.
 *
 * In plain words: the rules of deactivating, unlocking and re-sending passwords.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005, US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-05, API-USR-06, API-USR-07, API-USR-08
 *   lld:       LLD-EPIC-ADM-01 v0.24 section 6.1
 */
@Injectable()
export class UsersLifecycleService {
  constructor(
    private readonly users: UserRepository,
    private readonly writes: UserWriteRepository,
    private readonly workflow: WorkflowPort,
    private readonly delegation: DelegationPort,
    private readonly sessions: SessionRevocationPort,
    private readonly passwords: OneTimePasswordService,
    private readonly audit: AuditService,
  ) {}

  /** The user with this code, or 404. */
  private async mustFind(employeeCode: string): Promise<UserRecord> {
    const user = await this.users.findByCode(employeeCode);
    if (!user) throw new UnknownUserException();
    return user;
  }

  /** A local-sign-in user who is not Inactive: the only kind that has a password to reset or send (decision L-55). */
  private async localUser(employeeCode: string): Promise<UserRecord> {
    const user = await this.mustFind(employeeCode);
    if (user.authType !== 'LOCAL') throw new NotLocalUserException();
    if (user.status === 'INACTIVE') throw new UserInactiveException();
    return user;
  }

  /** Issues a one-time password and records it in the audit trail (the audit record never holds the password). */
  private async sendPassword(user: UserRecord, actor: string, reason: string): Promise<{ emailStatus: 'SENT' | 'FAILED' }> {
    const emailStatus = await this.passwords.issue({ id: user.id, email: user.email, fullName: user.fullName });
    await this.audit.recordChange({ actor, entity: 'User', entityKey: user.id, after: { emailStatus }, reason });
    return { emailStatus };
  }

  /**
   * Deactivates a user.
   *
   * In plain words: sets the user Inactive (never deletes), after a warning when they hold proposals, and never the last active Administrator.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-005
 * @subtask   ST-ADM01-005-BE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-05
 * @ac        AC-US005-01, AC-US005-02
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies UserRepository.findByCode, isAdministrator, adminCount, WorkflowPort, DelegationPort, UserWriteRepository.setStatus, SessionRevocationPort, AuditService.recordChange
   *
   * @param employeeCode - the user
   * @param input - reason, note and the confirmation after the proposals warning
   * @param actor - key of the Administrator
   * @returns The new status
   * @throws UnknownUserException, AlreadyInactiveException, LastAdministratorException, HoldsProposalsException
   */
  async deactivate(employeeCode: string, input: { reason: DeactivationReason; note?: string; confirmWithProposals?: boolean }, actor: string): Promise<{ status: 'INACTIVE' }> {
    const user = await this.mustFind(employeeCode);
    if (user.status === 'INACTIVE') throw new AlreadyInactiveException();
    if ((await this.users.isAdministrator(user.id)) && (await this.users.adminCount()) <= 1) throw new LastAdministratorException();
    await this.warnAboutProposals(user, input.confirmWithProposals === true);
    await this.writes.setStatus(user.id, 'INACTIVE', { reason: input.reason, note: input.note });
    await this.sessions.endSessions(user.id);
    await this.audit.recordChange({ actor, entity: 'User', entityKey: user.id, before: { status: user.status }, after: { status: 'INACTIVE', reason: input.reason, note: input.note }, reason: `Deactivated: ${input.reason}` });
    return { status: 'INACTIVE' };
  }

  /** Stops with HOLDS_PROPOSALS (count, monitor address, delegate) when proposals wait with the user and the warning was not confirmed. */
  private async warnAboutProposals(user: UserRecord, confirmed: boolean): Promise<void> {
    const count = await this.workflow.countProposalsHeldBy(user.id);
    if (count > 0 && !confirmed) throw new HoldsProposalsException(count, this.workflow.monitorUrl(), await this.delegation.hasActiveDelegate(user.id));
  }

  /**
   * Unlocks a user.
   *
   * In plain words: a Locked user becomes Active again with the lock cleared.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-06
 * @ac        AC-US007-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies UserRepository.findByCode, setStatus, AuditService.recordChange
   *
   * @param employeeCode - the user
   * @param actor - user key (audit)
   * @returns `ACTIVE`
   * @throws UnknownUserException (404)
   * @throws NotLockedException (409)
   */
  async unlock(employeeCode: string, actor: string): Promise<{ status: 'ACTIVE' }> {
    const user = await this.mustFind(employeeCode);
    if (user.status !== 'LOCKED') throw new NotLockedException();
    await this.writes.setStatus(user.id, 'ACTIVE', { clearLock: true });
    await this.audit.recordChange({ actor, entity: 'User', entityKey: user.id, before: { status: 'LOCKED' }, after: { status: 'ACTIVE' }, reason: 'Unlocked' });
    return { status: 'ACTIVE' };
  }

  /**
   * Resets a password.
   *
   * In plain words: a new one-time password replaces the old one and is e-mailed; local users only.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-07
 * @ac        AC-US007-02
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies UserRepository.findByCode, OneTimePasswordService.issue, AuditService.recordChange
   *
   * @param employeeCode - the user
   * @param actor - user key (audit)
   * @returns SENT or FAILED
   * @throws UnknownUserException (404)
   * @throws NotLocalUserException (422)
   * @throws UserInactiveException (409)
   */
  async resetPassword(employeeCode: string, actor: string): Promise<{ emailStatus: 'SENT' | 'FAILED' }> {
    return this.sendPassword(await this.localUser(employeeCode), actor, 'Password reset');
  }

  /**
   * Re-sends the one-time password.
   *
   * In plain words: a new one-time password is e-mailed and the old one stops working; only until the user has signed in.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-08
 * @ac        AC-US007-03
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies UserRepository.findByCode, OneTimePasswordService.issue, AuditService.recordChange
   *
   * @param employeeCode - the user
   * @param actor - user key (audit)
   * @returns SENT or FAILED
   * @throws UnknownUserException (404)
   * @throws NotLocalUserException (422)
   * @throws AlreadySignedInException (422)
   * @throws UserInactiveException (409)
   */
  async resendOneTimePassword(employeeCode: string, actor: string): Promise<{ emailStatus: 'SENT' | 'FAILED' }> {
    const user = await this.localUser(employeeCode);
    if (user.firstSignInAt) throw new AlreadySignedInException();
    return this.sendPassword(user, actor, 'One-time password sent again');
  }
}
