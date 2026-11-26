/**
 * @file    database.ts
 * @module  UsersModule
 *
 * @description
 * Prisma implementation of the user write repository. In plain words: the only file that changes the users table.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003, US-ADM01-005, US-ADM01-007
 * @subtask        ST-ADM01-003-BE-04, ST-ADM01-005-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user-write/database.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService, UserStatus } from '@libs/database';
import { DbTransaction, UserCompanyRoleRepository } from '@libs/organisation';
import { NewUser, UserAssignment, UserRecord } from '../user';
import { startOfToday, toUserRecord, userInclude } from '../user/user-helpers';
import { UserWriteRepository } from './contract';
import { UserPasswordWrites } from './password.contract';

/**
 * Prisma user write repository.
 *
 * In plain words: creates and changes users.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003, US-ADM01-005, US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7, FR-042.1, FR-042.4
 *   contracts: API-USR-02, API-USR-04, API-USR-05, API-USR-06, API-USR-07, API-USR-08
 *   lld:       LLD-EPIC-ADM-01 v0.29 section 6.1
 */
@Injectable()
export class UserWriteDatabaseRepository extends UserWriteRepository implements UserPasswordWrites {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roles: UserCompanyRoleRepository,
  ) {
    super();
  }

  /**
   * Creates a user.
   *
   * In plain words: writes the user and its company roles together.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-04
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02
 * @ac        AC-US003-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db $transaction, user.create, UserCompanyRoleRepository.replaceForUser
   *
   * @param data - the user
   * @param assignments - company, role and dates
   * @returns The created user
   */
  async create(data: NewUser, assignments: UserAssignment[]): Promise<UserRecord> {
    const id = await this.prisma.db.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { ...data, status: 'ACTIVE' } });
      await this.roles.replaceForUser(user.id, assignments.map((a) => ({ ...a, userId: user.id })), tx as unknown as DbTransaction);
      return user.id;
    });
    return this.read(id);
  }

  /**
   * Changes a user.
   *
   * In plain words: writes the changes and, when roles are given, replaces the company roles, in one transaction.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-04
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-04
 * @ac        AC-US003-04
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db $transaction, user.update, UserCompanyRoleRepository.replaceForUser
   *
   * @param employeeCode - the user
   * @param data - the changed fields; `newEmployeeCode` renames the key
   * @param assignments - the new set, or null to leave them
   * @returns The updated user
   */
  async update(employeeCode: string, data: Partial<NewUser> & { newEmployeeCode?: string }, assignments: UserAssignment[] | null): Promise<UserRecord> {
    const { newEmployeeCode, ...fields } = data;
    const id = await this.prisma.db.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { employeeCode }, data: { ...fields, ...(newEmployeeCode ? { employeeCode: newEmployeeCode } : {}) } });
      if (assignments) await this.roles.replaceForUser(user.id, assignments.map((a) => ({ ...a, userId: user.id })), tx as unknown as DbTransaction);
      return user.id;
    });
    return this.read(id);
  }

  /**
   * Sets the status.
   *
   * In plain words: Inactive with its reason and date, or Active again with the lock cleared.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-005
 * @subtask   ST-ADM01-005-BE-03
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-05, API-USR-06
 * @ac        AC-US005-01, AC-US007-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db user.update
   *
   * @param userId - the user
   * @param status - the new status
   * @param extra - reason, note, clear the lock
   * @returns Nothing
   */
  async setStatus(userId: string, status: UserStatus, extra?: { reason?: string; note?: string; clearLock?: boolean }): Promise<void> {
    const lock = extra?.clearLock ? { lockedUntil: null, failedAttempts: 0 } : {};
    const deactivation =
      status === 'INACTIVE'
        ? { deactivatedAt: new Date(), deactivationReason: extra?.reason ?? null, deactivationNote: extra?.note ?? null }
        : { deactivatedAt: null, deactivationReason: null, deactivationNote: null };
    await this.prisma.db.user.update({ where: { id: userId }, data: { status, ...lock, ...deactivation } });
  }

  /**
   * Sets must-change-password.
   *
   * In plain words: a user with a one-time password must change it at the first sign-in.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-03
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-07, API-USR-08
 * @ac        AC-US007-02
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db user.update
   *
   * @param userId - the user
   * @param value - true or false
   * @returns Nothing
   */
  async setMustChangePassword(userId: string, value: boolean): Promise<void> {
    await this.prisma.db.user.update({ where: { id: userId }, data: { mustChangePassword: value } });
  }

  /** Saves a wrong password and, when the lock starts, the lock time and the LOCKED status. */
  async recordFailedAttempt(userId: string, failedAttempts: number, lockedUntil: Date | null): Promise<void> {
    await this.prisma.db.user.update({ where: { id: userId }, data: { failedAttempts, lockedUntil, ...(lockedUntil ? { status: 'LOCKED' as UserStatus } : {}) } });
  }

  /** Clears the count and the lock after a good sign-in; a LOCKED status goes back to ACTIVE. */
  async clearFailures(userId: string): Promise<void> {
    await this.prisma.db.user.update({ where: { id: userId }, data: { failedAttempts: 0, lockedUntil: null } });
    await this.prisma.db.user.updateMany({ where: { id: userId, status: 'LOCKED' }, data: { status: 'ACTIVE' } });
  }

  /** Saves the hash, clears the "must change" flag, the failed attempts and the lock (EPIC-LGN-02). */
  async setPasswordHash(userId: string, hash: string, _hashType: string): Promise<void> {
    await this.prisma.db.user.update({ where: { id: userId }, data: { passwordHash: hash, mustChangePassword: false } });
    await this.clearFailures(userId);
  }

  /** Marks the unused one-time passwords of the user as used (EPIC-LGN-02). */
  async markOneTimePasswordUsed(userId: string): Promise<void> {
    await this.prisma.db.oneTimePassword.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
  }

  /** Sets the last sign-in time, and the first sign-in time when it is still empty. */
  async setSignInTimes(userId: string, now: Date): Promise<void> {
    await this.prisma.db.user.updateMany({ where: { id: userId, firstSignInAt: null }, data: { firstSignInAt: now } });
    await this.prisma.db.user.update({ where: { id: userId }, data: { lastSignInAt: now } });
  }

  /** Reads one user back as a record. */
  private async read(id: string): Promise<UserRecord> {
    return toUserRecord(await this.prisma.db.user.findUniqueOrThrow({ where: { id }, include: userInclude(startOfToday()) }));
  }
}
