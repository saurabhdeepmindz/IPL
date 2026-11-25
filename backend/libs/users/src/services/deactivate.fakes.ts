/**
 * @file    deactivate.fakes.ts
 * @module  UsersModule
 *
 * @description
 * Test helpers of the deactivate tests. In plain words: in-memory stand-ins for the workflow, the delegation and the session ports, and the user reads with two Administrator answers.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005
 * @subtask        ST-ADM01-005-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/deactivate.fakes.ts
 * @lld-synced     v0.27
 * @status         built
 */

import { FakeUsers } from './otp.fakes';
import { userRecord } from './users.fakes';

/** The workflow port: holds as many proposals as it is told. */
export class FakeWorkflow {
  held = 0;
  monitor = 'https://workflow.example.invalid/monitor';
  async countProposalsHeldBy(): Promise<number> {
    return this.held;
  }
  monitorUrl(): string {
    return this.monitor;
  }
}

/** The delegation port. */
export class FakeDelegation {
  has = false;
  async hasActiveDelegate(): Promise<boolean> {
    return this.has;
  }
}

/** The session port: remembers whose sessions were ended. */
export class FakeSessions {
  ended: string[] = [];
  async endSessions(userId: string): Promise<void> {
    this.ended.push(userId);
  }
}

/** The user reads plus one Administrator (`10030`) and the number of active Administrators. */
export class FakeUsersWithAdmin extends FakeUsers {
  adminTotal = 2;
  constructor() {
    super();
    this.users['10030'] = userRecord({ employeeCode: '10030', id: 'u-admin', authType: 'LOCAL', companies: [{ code: 'IPL', roles: ['Administrator'] }] });
  }
  async isAdministrator(userId: string): Promise<boolean> {
    return userId === 'u-admin';
  }
  async adminCount(): Promise<number> {
    return this.adminTotal;
  }
}
