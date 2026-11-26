/**
 * @file    holds-proposals.exception.ts
 * @module  UsersModule
 *
 * @description
 * Typed error. In plain words: the user holds proposals and the warning was not confirmed; carries the count and the workflow monitor address (HTTP 409).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/libs/users/src/errors/holds-proposals.exception.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { ConflictAppException } from '@libs/common';

/**
 * HoldsProposalsException.
 *
 * In plain words: the user holds proposals and the warning was not confirmed; carries the count and the workflow monitor address (HTTP 409).
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.29 section 6.1
 */
export class HoldsProposalsException extends ConflictAppException {
  constructor(
    readonly count: number,
    readonly workflowMonitorUrl: string,
    readonly hasDelegate: boolean,
  ) {
    super('HOLDS_PROPOSALS', `The user holds ${count} proposal(s)`, [
      { field: 'count', message: String(count) },
      { field: 'workflowMonitorUrl', message: workflowMonitorUrl },
      { field: 'hasDelegate', message: String(hasDelegate) },
    ]);
  }
}
