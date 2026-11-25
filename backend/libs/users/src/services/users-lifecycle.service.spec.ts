/**
 * @file    users-lifecycle.service.spec.ts
 * @module  UsersModule
 *
 * @description
 * Unit tests of the users lifecycle service (Jest). Written before the code (TDD); fakes replace the repositories, the one-time password service and the audit service. In plain words: shows that a locked user is unlocked and that a one-time password is reset or sent again by the story's rules. The cases of story 005 (deactivate) stay `it.todo`.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-005, US-ADM01-007
 * @subtask        ST-ADM01-005-BE-04, ST-ADM01-007-BE-05
 * @lld            LLD-EPIC-ADM-01 v0.17 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.17.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/users-lifecycle.service.spec.ts
 * @lld-synced     v0.17
 * @status         built
 */

import { AlreadySignedInException } from '../errors/already-signed-in.exception';
import { NotLocalUserException } from '../errors/not-local-user.exception';
import { NotLockedException } from '../errors/not-locked.exception';
import { UnknownUserException } from '../errors/unknown-user.exception';
import { AlreadyInactiveException } from '../errors/already-inactive.exception';
import { HoldsProposalsException } from '../errors/holds-proposals.exception';
import { LastAdministratorException } from '../errors/last-administrator.exception';
import { UserInactiveException } from '../errors/user-inactive.exception';
import { UsersLifecycleService } from './users-lifecycle.service';
import { FakeDelegation, FakeSessions, FakeUsersWithAdmin, FakeWorkflow } from './deactivate.fakes';
import { FakeOtpService, FakeWrites } from './otp.fakes';

describe('UsersLifecycleService (story 007)', () => {
  let users: FakeUsersWithAdmin;
  let workflow: FakeWorkflow;
  let delegation: FakeDelegation;
  let sessions: FakeSessions;
  let writes: FakeWrites;
  let otp: FakeOtpService;
  let audit: { recordChange: jest.Mock };
  let service: UsersLifecycleService;

  beforeEach(() => {
    users = new FakeUsersWithAdmin();
    workflow = new FakeWorkflow();
    delegation = new FakeDelegation();
    sessions = new FakeSessions();
    writes = new FakeWrites();
    otp = new FakeOtpService();
    audit = { recordChange: jest.fn().mockResolvedValue('audit-1') };
    service = new UsersLifecycleService(users as never, writes as never, workflow as never, delegation as never, sessions as never, otp as never, audit as never);
  });

  /**
   * @tc        TC-ADM01-007-J01
   * @story     US-ADM01-007
   * @ac        AC-US007-01
   * @subtask   ST-ADM01-007-BE-05
   * In plain words: a Locked user becomes Active again with the lock cleared and the change is audited; a user who is not locked gives NOT_LOCKED.
   */
  it('unlocks a locked user', async () => {
    await expect(service.unlock('10023', 'actor-1')).resolves.toEqual({ status: 'ACTIVE' });
    expect(writes.statuses).toEqual([{ userId: 'u-locked', status: 'ACTIVE', extra: { clearLock: true } }]);
    expect(audit.recordChange).toHaveBeenCalledWith(expect.objectContaining({ actor: 'actor-1', entity: 'User', entityKey: 'u-locked', before: { status: 'LOCKED' }, after: { status: 'ACTIVE' } }));
    audit.recordChange.mockClear();
    await expect(service.unlock('10021', 'actor-1')).rejects.toBeInstanceOf(NotLockedException);
    await expect(service.unlock('99999', 'actor-1')).rejects.toBeInstanceOf(UnknownUserException);
    expect(audit.recordChange).not.toHaveBeenCalled();
    expect(writes.statuses).toHaveLength(1);
  });

  /**
   * @tc        TC-ADM01-007-J03
   * @story     US-ADM01-007
   * @ac        AC-US007-03
   * @subtask   ST-ADM01-007-BE-05
   * In plain words: a local user gets a new one-time password and the action is audited (with no password in it); an SSO user, a user who has signed in and an Inactive user are refused.
   */
  it('sends the one-time password again', async () => {
    await expect(service.resendOneTimePassword('10021', 'actor-1')).resolves.toEqual({ emailStatus: 'SENT' });
    expect(otp.issued).toEqual([{ id: 'u-local', email: 'local@example.invalid', fullName: 'Test User' }]);
    expect(audit.recordChange).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(audit.recordChange.mock.calls[0][0])).toMatch(/One-time password/);
    audit.recordChange.mockClear();
    await expect(service.resendOneTimePassword('10022', 'actor-1')).rejects.toBeInstanceOf(NotLocalUserException);
    await expect(service.resendOneTimePassword('10024', 'actor-1')).rejects.toBeInstanceOf(AlreadySignedInException);
    await expect(service.resendOneTimePassword('10025', 'actor-1')).rejects.toBeInstanceOf(UserInactiveException);
    expect(otp.issued).toHaveLength(1);
    expect(audit.recordChange).not.toHaveBeenCalled();
    otp.answer = 'FAILED';
    await expect(service.resendOneTimePassword('10021', 'actor-1')).resolves.toEqual({ emailStatus: 'FAILED' });
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-02
   * @subtask ST-ADM01-007-BE-05
   * In plain words: supporting test. Reset password is for local users only, also for a locked user; an SSO or Inactive user is refused; an unknown user gives 404.
   */
  it('resets a password for local users only', async () => {
    await expect(service.resetPassword('10021', 'actor-1')).resolves.toEqual({ emailStatus: 'SENT' });
    await expect(service.resetPassword('10023', 'actor-1')).resolves.toEqual({ emailStatus: 'SENT' });
    await expect(service.resetPassword('10022', 'actor-1')).rejects.toBeInstanceOf(NotLocalUserException);
    await expect(service.resetPassword('10025', 'actor-1')).rejects.toBeInstanceOf(UserInactiveException);
    await expect(service.resetPassword('99999', 'actor-1')).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
    expect(otp.issued.map((i) => i.id)).toEqual(['u-local', 'u-locked']);
    expect(audit.recordChange).toHaveBeenCalledTimes(2);
  });

  const leave = { reason: 'LEFT_COMPANY' as const, note: 'Resigned' };

  /**
   * @tc        TC-ADM01-005-J01
   * @story     US-ADM01-005
   * @ac        AC-US005-01
   * @subtask   ST-ADM01-005-BE-04
   * In plain words: an Active user becomes Inactive with the reason and note, the sessions end once and one audit record is written; the last active Administrator is refused and nothing changes.
   */
  it('J01 deactivates a user and protects the last Administrator', async () => {
    await expect(service.deactivate('10021', leave, 'actor-1')).resolves.toEqual({ status: 'INACTIVE' });
    expect(writes.statuses).toEqual([{ userId: 'u-local', status: 'INACTIVE', extra: { reason: 'LEFT_COMPANY', note: 'Resigned' } }]);
    expect(sessions.ended).toEqual(['u-local']);
    expect(audit.recordChange).toHaveBeenCalledTimes(1);
    expect(audit.recordChange).toHaveBeenCalledWith(expect.objectContaining({ actor: 'actor-1', entity: 'User', entityKey: 'u-local', before: { status: 'ACTIVE' }, after: { status: 'INACTIVE', reason: 'LEFT_COMPANY', note: 'Resigned' } }));
    users.adminTotal = 1;
    audit.recordChange.mockClear();
    await expect(service.deactivate('10030', leave, 'actor-1')).rejects.toBeInstanceOf(LastAdministratorException);
    expect(writes.statuses).toHaveLength(1);
    expect(sessions.ended).toHaveLength(1);
    expect(audit.recordChange).not.toHaveBeenCalled();
  });

  /**
   * @tc        TC-ADM01-005-J02
   * @story     US-ADM01-005
   * @ac        AC-US005-02
   * @subtask   ST-ADM01-005-BE-04
   * In plain words: a user who holds proposals gives HOLDS_PROPOSALS with the count, the monitor address and whether there is a delegate, until the warning is confirmed.
   */
  it('J02 warns about held proposals', async () => {
    workflow.held = 7;
    const err = await service.deactivate('10021', leave, 'actor-1').then(() => null, (e: HoldsProposalsException) => e);
    expect(err).toBeInstanceOf(HoldsProposalsException);
    expect(err).toMatchObject({ count: 7, workflowMonitorUrl: 'https://workflow.example.invalid/monitor', hasDelegate: false });
    delegation.has = true;
    await expect(service.deactivate('10021', leave, 'actor-1')).rejects.toMatchObject({ hasDelegate: true });
    expect(writes.statuses).toHaveLength(0);
    expect(audit.recordChange).not.toHaveBeenCalled();
    await expect(service.deactivate('10021', { ...leave, confirmWithProposals: true }, 'actor-1')).resolves.toEqual({ status: 'INACTIVE' });
    expect(writes.statuses).toHaveLength(1);
  });

  /**
   * @story   US-ADM01-005
   * @ac      AC-US005-01
   * @subtask ST-ADM01-005-BE-04
   * In plain words: supporting test. An Inactive user gives 409, an unknown user 404, and an Administrator who is not the last one can be deactivated; a refusal writes nothing.
   */
  it('refuses an Inactive or unknown user and allows an Administrator who is not the last', async () => {
    await expect(service.deactivate('10025', leave, 'actor-1')).rejects.toBeInstanceOf(AlreadyInactiveException);
    await expect(service.deactivate('99999', leave, 'actor-1')).rejects.toBeInstanceOf(UnknownUserException);
    expect(writes.statuses).toHaveLength(0);
    expect(sessions.ended).toHaveLength(0);
    expect(audit.recordChange).not.toHaveBeenCalled();
    users.adminTotal = 2;
    await expect(service.deactivate('10030', leave, 'actor-1')).resolves.toEqual({ status: 'INACTIVE' });
  });
});
