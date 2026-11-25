/**
 * @file    contract.ts
 * @module  UsersModule
 *
 * @description
 * Contract of the user repository. In plain words: what the roles code may ask about users. MINIMAL for US-ADM01-011 (one method); US-ADM01-001 adds the rest (`findPage`, `findByEmail`, `create` and so on) to the same files (decision L-29).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.13 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.13.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user/contract.ts
 * @lld-synced     v0.13
 * @status         built
 */

import { UserStatus } from '@libs/database';

/** A user as the roles code needs to see one. */
export interface UserRef {
  id: string;
  employeeCode: string;
  fullName: string;
  status: UserStatus;
  departmentName: string | null;
}

/**
 * User repository contract.
 *
 * In plain words: the roles service depends on this class, and tests replace it with a fake.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-05, API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.13 §6.4
 */
export abstract class UserRepository {
  /** The users with these employee codes; a code that matches nobody is simply not in the answer. */
  abstract findByCodes(codes: string[]): Promise<UserRef[]>;
}
