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
 * @lld            LLD-EPIC-ADM-01 v0.15 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.15.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user-write/database.ts
 * @lld-synced     v0.15
 * @status         pseudo
 */

import { Injectable } from '@nestjs/common';
import { PrismaService, UserStatus } from '@libs/database';
import { NewUser, UserAssignment, UserRecord } from '../user';
import { UserWriteRepository } from './contract';

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
 *   lld:       LLD-EPIC-ADM-01 v0.15 section 6.1
 */
@Injectable()
export class UserWriteDatabaseRepository extends UserWriteRepository {
  constructor(private readonly prisma: PrismaService) {
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
 * @lld       LLD-EPIC-ADM-01 v0.15 §6.1
 * @status    pseudo
   *
   * @dependencies PrismaService.db $transaction, user.create, userCompanyRole.createMany
   *
   * @param data - the user
   * @param assignments - company, role and dates
   * @returns The created user
   */
  async create(data: NewUser, assignments: UserAssignment[]): Promise<UserRecord> {
    // TODO: 1. In one transaction create the user as ACTIVE, then one `userCompanyRole` row per assignment (assigned by the caller's code is set by the service through `data`).
    // TODO: 2. Return the user through findByCode.
    throw new Error('pseudo-code: not implemented');
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
 * @lld       LLD-EPIC-ADM-01 v0.15 §6.1
 * @status    pseudo
   *
   * @dependencies PrismaService.db $transaction, user.update
   *
   * @param employeeCode - the user
   * @param data - the changed fields; `newEmployeeCode` renames the key
   * @param assignments - the new set, or null to leave them
   * @returns The updated user
   */
  async update(employeeCode: string, data: Partial<NewUser> & { newEmployeeCode?: string }, assignments: UserAssignment[] | null): Promise<UserRecord> {
    // TODO: 1. In one transaction update the user row (set `employeeCode` from `newEmployeeCode` when given).
    // TODO: 2. When assignments is not null, replace the company roles (the user-company-role repository does the rows).
    throw new Error('pseudo-code: not implemented');
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
 * @lld       LLD-EPIC-ADM-01 v0.15 §6.1
 * @status    pseudo
   *
   * @dependencies PrismaService.db user.update
   *
   * @param userId - the user
   * @param status - the new status
   * @param extra - reason, note, clear the lock
   * @returns Nothing
   */
  async setStatus(userId: string, status: UserStatus, extra?: { reason?: string; note?: string; clearLock?: boolean }): Promise<void> {
    // The Inactive branch (deactivation date, reason and note) is added by story 005.
    const lock = extra?.clearLock ? { lockedUntil: null, failedAttempts: 0 } : {};
    await this.prisma.db.user.update({ where: { id: userId }, data: { status, ...lock } });
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
 * @lld       LLD-EPIC-ADM-01 v0.15 §6.1
 * @status    pseudo
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
}
