/**
 * @file    session-revocation.stand-in.ts
 * @module  UsersModule
 *
 * @description
 * Stand-in of SessionRevocationPort. In plain words: does nothing until the sign-in epic keeps a session list.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/ports/session-revocation.stand-in.ts
 * @lld-synced     v0.25
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { SessionRevocationPort } from './session-revocation.port';

/**
 * SessionRevocationStandIn.
 *
 * In plain words: does nothing until the sign-in epic keeps a session list.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-005
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-01 to API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.25 section 6.1
 */
@Injectable()
export class SessionRevocationStandIn extends SessionRevocationPort {
  async endSessions(): Promise<void> {
    // Nothing to end yet: the access token lives 15 minutes and the sign-in already refuses an Inactive user (TBD-ADM01-02).
  }
}
