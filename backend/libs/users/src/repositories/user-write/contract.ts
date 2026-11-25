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
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user-write/contract.ts
 * @lld-synced     v0.28
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
 *   lld:       LLD-EPIC-ADM-01 v0.28 section 6.1
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
}
