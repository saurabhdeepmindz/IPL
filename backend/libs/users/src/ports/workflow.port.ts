/**
 * @file    workflow.port.ts
 * @module  UsersModule
 *
 * @description
 * Proposals held by a user. In plain words: asks the workflow how many proposals are waiting with a user. TBD-ADM01-04: the workflow epic replaces the stand-in.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/ports/workflow.port.ts
 * @lld-synced     v0.25
 * @status         built
 */

/**
 * WorkflowPort (port).
 *
 * In plain words: one small question; the application wires the answer.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.25 section 6.1
 */
export abstract class WorkflowPort {
  /** How many proposals are waiting with the user. */
  abstract countProposalsHeldBy(userId: string): Promise<number>;

  /** Where the Administrator can see the proposals (the workflow monitor). */
  abstract monitorUrl(): string;
}
