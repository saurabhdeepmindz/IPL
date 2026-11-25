/**
 * @file    masters.port.ts
 * @module  UsersModule
 *
 * @description
 * Organisation masters (departments and designations). In plain words: asks "does this department or designation exist, and is this the highest designation?" without knowing where the masters are kept. TBD-ADM01-01: EPIC-ADM-02 replaces the stand-in.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/ports/masters.port.ts
 * @lld-synced     v0.26
 * @status         built
 */

/**
 * MastersPort (port).
 *
 * In plain words: one small question; the application wires the answer.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.26 section 6.1
 */
export abstract class MastersPort {
  /** True when the department exists. */
  abstract departmentExists(departmentId: string): Promise<boolean>;

  /** True when the designation exists. */
  abstract designationExists(designationId: string): Promise<boolean>;

  /** True when this is the highest designation (a user with it may have no reporting manager, decision OP-07). */
  abstract isHighestDesignation(designationId: string): Promise<boolean>;
}
