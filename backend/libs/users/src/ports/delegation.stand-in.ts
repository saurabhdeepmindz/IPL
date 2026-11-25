/**
 * @file    delegation.stand-in.ts
 * @module  UsersModule
 *
 * @description
 * Stand-in of DelegationPort. In plain words: answers false until the delegation epic exists.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/ports/delegation.stand-in.ts
 * @lld-synced     v0.21
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { DelegationPort } from './delegation.port';

/**
 * DelegationStandIn.
 *
 * In plain words: answers false until the delegation epic exists.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.21 section 6.1
 */
@Injectable()
export class DelegationStandIn extends DelegationPort {
  async hasActiveDelegate(): Promise<boolean> {
    return false;
  }
}
