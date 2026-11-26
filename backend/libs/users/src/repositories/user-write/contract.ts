/**
 * @file    contract.ts
 * @module  UsersModule
 *
 * @description
 * Contract of the user write repository. In plain words: everything that changes a user. Kept apart from `UserRepository` (the reads) so each file stays under 250 lines (decision L-41).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003, US-ADM01-005, US-ADM01-007
 * @subtask        ST-ADM01-003-BE-04, ST-ADM01-005-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user-write/contract.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { UserStatus } from '@libs/database';
import { NewUser, UserAssignment, UserRecord } from '../user';

/**
 * User write repository contract.
 *
 * In plain words: the command and lifecycle services depend on this class.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003, US-ADM01-005, US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7, FR-042.1, FR-042.4
 *   contracts: API-USR-02, API-USR-04, API-USR-05, API-USR-06, API-USR-07, API-USR-08
 *   lld:       LLD-EPIC-ADM-01 v0.29 section 6.1
 */
export abstract class UserWriteRepository {
  /** Creates the user and its company roles in one transaction. */
  abstract create(data: NewUser, assignments: UserAssignment[]): Promise<UserRecord>;

  /** Changes the user (and, when given, replaces its company roles) in one transaction. */
  abstract update(employeeCode: string, data: Partial<NewUser> & { newEmployeeCode?: string }, assignments: UserAssignment[] | null): Promise<UserRecord>;

  /** Sets the status with the fields that go with it (deactivation, unlock, lock counters). */
  abstract setStatus(userId: string, status: UserStatus, extra?: { reason?: string; note?: string; clearLock?: boolean }): Promise<void>;

  /** Sets `mustChangePassword`. */
  abstract setMustChangePassword(userId: string, value: boolean): Promise<void>;

  /**
   * Saves a wrong password.
   *
   * In plain words: stores the new count of wrong passwords and, when the lock starts, the end of the lock and the LOCKED status.
   *
   * @story US-LGN01-001
   * @subtask ST-LGN01-001-BE-03
   */
  abstract recordFailedAttempt(userId: string, failedAttempts: number, lockedUntil: Date | null): Promise<void>;

  /**
   * Clears the wrong-password count after a good sign-in.
   *
   * In plain words: count back to 0, no lock, and a LOCKED status goes back to ACTIVE.
   *
   * @story US-LGN01-001
   * @subtask ST-LGN01-001-BE-03
   */
  abstract clearFailures(userId: string): Promise<void>;

  /**
   * Saves the sign-in times.
   *
   * In plain words: sets the last sign-in time, and the first sign-in time when it was empty.
   *
   * @story US-LGN01-001
   * @subtask ST-LGN01-001-BE-03
   */
  abstract setSignInTimes(userId: string, now: Date): Promise<void>;
}
