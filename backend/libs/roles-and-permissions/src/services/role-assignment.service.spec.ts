/**
 * @file    role-assignment.service.spec.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Unit tests of the role assignment service (Jest). Written before the code (TDD); fakes replace the repositories, the cache port and the audit service. In plain words: shows that a role is given to users and shown with its holders by the story's rules.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/services/role-assignment.service.spec.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { NotFoundAppException } from '@libs/common';
import { RoleInactiveException } from '../errors/role-inactive.exception';
import { UserNotFoundException } from '../errors/user-not-found.exception';
import { AssignInput, RoleAssignmentService } from './role-assignment.service';
import { AssignRoleRepo, FakeHolders, FakeUsers } from './role-assignment.fakes';
import { FakeCellRepo } from './roles.fakes';

const input = (over: Partial<AssignInput> = {}): AssignInput => ({
  roleId: 'rv',
  employeeCodes: ['10011', '10012'],
  companyCode: 'IPL',
  validFrom: new Date('2026-11-26'),
  reason: 'audit access',
  ...over,
});

describe('RoleAssignmentService', () => {
  let holders: FakeHolders;
  let cells: FakeCellRepo;
  let cache: { clearUser: jest.Mock };
  let audit: { recordChange: jest.Mock };
  let service: RoleAssignmentService;
  const assign = (over: Partial<AssignInput> = {}, company = 'IPL') => service.assignUsers(input(over), company, 'actor-1', '10001');

  beforeEach(() => {
    holders = new FakeHolders();
    cells = new FakeCellRepo();
    cache = { clearUser: jest.fn().mockResolvedValue(undefined) };
    audit = { recordChange: jest.fn().mockResolvedValue('audit-1') };
    service = new RoleAssignmentService(new AssignRoleRepo() as never, cells as never, holders as never, new FakeUsers() as never, cache as never, audit as never);
  });

  /**
   * @tc        TC-ADM01-011-J01
   * @story     US-ADM01-011
   * @ac        AC-US011-01
   * @subtask   ST-ADM01-011-BE-03
   * In plain words: users are given the role with the company and the first day; each user's cached rights are cleared; the change is audited with the reason.
   */
  it('gives a role to users, clears their cache and audits it', async () => {
    await expect(assign()).resolves.toEqual({ assigned: 2 });
    expect(holders.inserted[0]).toEqual([
      { userId: 'u1', roleId: 'rv', companyCode: 'IPL', validFrom: new Date('2026-11-26'), assignedBy: '10001' },
      { userId: 'u2', roleId: 'rv', companyCode: 'IPL', validFrom: new Date('2026-11-26'), assignedBy: '10001' },
    ]);
    expect(cache.clearUser.mock.calls.map((c) => c[0]).sort()).toEqual(['u1', 'u2']);
    expect(audit.recordChange).toHaveBeenCalledTimes(1);
    expect(audit.recordChange).toHaveBeenCalledWith(
      expect.objectContaining({ actor: 'actor-1', entity: 'Role', entityKey: 'rv', reason: 'audit access', after: expect.objectContaining({ companyCode: 'IPL', employeeCodes: ['10011', '10012'] }) }),
    );
  });

  /**
   * @tc        TC-ADM01-011-J02
   * @story     US-ADM01-011
   * @ac        AC-US011-02
   * @subtask   ST-ADM01-011-BE-03
   * In plain words: the details list the people who hold the role by company with the day they got it, and what the role allows.
   */
  it('shows the role with its holders and what it allows', async () => {
    await assign();
    holders.give('u1', 'rv', 'IPLFB');
    cells.byRole.rv = [{ key: 'audit.view', allowed: true, scope: 'COMPANY' }, { key: 'users.view', allowed: false, scope: null }];
    const one = await service.getDetails('rv', 'IPL');
    expect(one.role.name).toBe('Report Viewer');
    expect(one.users.map((u) => [u.employeeCode, u.name, u.department, u.company])).toEqual([['10011', 'First User', 'Finance', 'IPL'], ['10012', 'Second User', null, 'IPL']]);
    expect(one.users[0].assignedOn).toBeInstanceOf(Date);
    expect(one.allows).toEqual([{ permission: 'audit.view', scope: 'COMPANY' }]);
    expect((await service.getDetails('rv', null)).users.map((u) => u.company).sort()).toEqual(['IPL', 'IPL', 'IPLFB']);
    expect(holders.lastListCompany).toBeNull();
    await expect(service.getDetails('nope', 'IPL')).rejects.toMatchObject({ code: 'ROLE_NOT_FOUND' });
    await expect(service.getDetails('nope', 'IPL')).rejects.toBeInstanceOf(NotFoundAppException);
  });

  /**
   * @tc        TC-ADM01-011-J03
   * @story     US-ADM01-011
   * @ac        AC-US011-03
   * @subtask   ST-ADM01-011-BE-03
   * In plain words: a user who already holds a business role can be given Report Viewer and then holds both.
   */
  it('adds a second role to a user who already has one', async () => {
    holders.give('u1', 'init');
    await expect(assign({ employeeCodes: ['10011'] })).resolves.toEqual({ assigned: 1 });
    expect(holders.rows.filter((r) => r.userId === 'u1').map((r) => r.roleId).sort()).toEqual(['init', 'rv']);
  });

  /**
   * @story   US-ADM01-011
   * @ac      AC-US011-01
   * @subtask ST-ADM01-011-BE-03
   * In plain words: supporting test (decisions L-34, L-37). A user who already holds the role is skipped; a call that skips everyone writes no audit record and clears no cache.
   */
  it('skips a user who already holds the role', async () => {
    holders.give('u1', 'rv');
    await expect(assign()).resolves.toEqual({ assigned: 1 });
    expect(holders.inserted[0].map((r) => r.userId)).toEqual(['u2']);
    audit.recordChange.mockClear();
    cache.clearUser.mockClear();
    await expect(assign()).resolves.toEqual({ assigned: 0 });
    expect(audit.recordChange).not.toHaveBeenCalled();
    expect(cache.clearUser).not.toHaveBeenCalled();
  });

  /**
   * @story   US-ADM01-011
   * @ac      AC-US011-01
   * @subtask ST-ADM01-011-BE-03
   * In plain words: supporting test (decision L-36). An unknown or Inactive user stops everything and every such code is named; nothing is saved.
   */
  it('refuses unknown and Inactive users, naming them all, and saves nothing', async () => {
    const err = await assign({ employeeCodes: ['10011', 'ZZZZZ', '10013'] }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(UserNotFoundException);
    expect(err).toMatchObject({ code: 'USER_NOT_FOUND', codes: ['ZZZZZ', '10013'] });
    expect(holders.inserted).toEqual([]);
    expect(cache.clearUser).not.toHaveBeenCalled();
    expect(audit.recordChange).not.toHaveBeenCalled();
  });

  /**
   * @story   US-ADM01-011
   * @ac      AC-US011-01
   * @subtask ST-ADM01-011-BE-03
   * In plain words: supporting test. A role that is not Active, a role that does not exist and another company are each refused.
   */
  it('refuses an inactive role, an unknown role and another company', async () => {
    await expect(assign({ roleId: 'old' })).rejects.toBeInstanceOf(RoleInactiveException);
    await expect(assign({ roleId: 'draft' })).rejects.toMatchObject({ code: 'ROLE_INACTIVE' });
    await expect(assign({ roleId: 'nope' })).rejects.toMatchObject({ code: 'ROLE_NOT_FOUND' });
    await expect(assign({ companyCode: 'IPLFB' })).rejects.toMatchObject({ code: 'COMPANY_MISMATCH' });
    expect(holders.inserted).toEqual([]);
  });
});
