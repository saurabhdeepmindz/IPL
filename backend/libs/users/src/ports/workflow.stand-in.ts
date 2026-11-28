/**
 * @file    workflow.stand-in.ts
 * @module  UsersModule
 *
 * @description
 * Stand-in of WorkflowPort. In plain words: answers 0 until the workflow epic exists.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/libs/users/src/ports/workflow.stand-in.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { readEnv } from '@config';
import { WorkflowPort } from './workflow.port';

/**
 * WorkflowStandIn.
 *
 * In plain words: answers 0 until the workflow epic exists.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.29 section 6.1
 */
@Injectable()
export class WorkflowStandIn extends WorkflowPort {
  async countProposalsHeldBy(): Promise<number> {
    return 0;
  }

  /** The workflow monitor address, from `WORKFLOW_MONITOR_URL` (a relative address when it is not set). */
  monitorUrl(): string {
    return readEnv('WORKFLOW_MONITOR_URL') ?? '/workflow/monitor';
  }
}
