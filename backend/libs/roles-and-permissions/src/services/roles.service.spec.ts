/**
 * @file    roles.service.spec.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Unit tests of the roles service (Jest). Written before the code (TDD); fakes replace the repositories and the audit service. In plain words: shows that roles are listed, created, changed and deactivated by the story's rules.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-06
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/services/roles.service.spec.ts
 * @lld-synced     v0.20
 * @status         built
 */

import { RoleStatus } from '@libs/database';
import { RoleInUseException } from '../errors/role-in-use.exception';
import { RoleLockedException } from '../errors/role-locked.exception';
import { RoleNameExistsException } from '../errors/role-name-exists.exception';
import { RolesService } from './roles.service';
import { FakeCellRepo, FakeRoleRepo, roleRecord, SIX_ROLES } from './roles.fakes';

const fields = { name: 'Reviewer', description: 'reviews', status: RoleStatus.ACTIVE };

describe('RolesService', () => {
  let roles: FakeRoleRepo;
  let cells: FakeCellRepo;
  let audit: { recordChange: jest.Mock };
  let service: RolesService;

  beforeEach(() => {
    roles = new FakeRoleRepo();
    cells = new FakeCellRepo();
    audit = { recordChange: jest.fn().mockResolvedValue(undefined) };
    service = new RolesService(roles as never, cells as never, audit as never);
  });

  /**
   * @tc        TC-ADM01-010-J01
   * @story     US-ADM01-010
   * @ac        AC-US010-01
   * @subtask   ST-ADM01-010-BE-06
   * In plain words: the list returns each role and the filters narrow it.
   */
  it('lists roles and applies the filters', async () => {
    expect(await service.list({})).toHaveLength(6);
    expect((await service.list({ q: 'audit' })).map((r) => r.name)).toEqual(['Auditor']);
    expect(await service.list({ status: RoleStatus.INACTIVE })).toEqual([]);
  });

  /**
   * @tc        TC-ADM01-010-J02
   * @story     US-ADM01-010
   * @ac        AC-US010-02
   * @subtask   ST-ADM01-010-BE-06
   * In plain words: a new role copies the cells of the source role, the given cells win, and an audit record is written.
   */
  it('creates a role with copied cells and an audit record', async () => {
    cells.byRole['std-0'] = [
      { key: 'users.view', allowed: true, scope: 'COMPANY' },
      { key: 'users.manage', allowed: false, scope: null },
    ];
    const created = await service.create(fields, 'std-0', [{ permissionKey: 'users.manage', allowed: true, scope: 'OWN' }], 'actor-1', 'new reviewers');
    expect(roles.created[0].cells).toEqual(
      expect.arrayContaining([
        { permissionKey: 'users.view', allowed: true, scope: 'COMPANY' },
        { permissionKey: 'users.manage', allowed: true, scope: 'OWN' },
      ]),
    );
    expect(roles.created[0].cells).toHaveLength(2);
    expect(audit.recordChange).toHaveBeenCalledWith(expect.objectContaining({ actor: 'actor-1', entity: 'Role', entityKey: created.id, reason: 'new reviewers' }));
  });

  /**
   * @tc        TC-ADM01-010-J03
   * @story     US-ADM01-010
   * @ac        AC-US010-03
   * @subtask   ST-ADM01-010-BE-06
   * In plain words: a name that exists is refused and nothing is created.
   */
  it('refuses a name that exists, whatever the letter case', async () => {
    await expect(service.create({ ...fields, name: 'auditor' }, null, [], 'a', 'r')).rejects.toBeInstanceOf(RoleNameExistsException);
    expect(roles.created).toEqual([]);
    expect(audit.recordChange).not.toHaveBeenCalled();
  });

  /**
   * @tc        TC-ADM01-010-J04
   * @story     US-ADM01-010
   * @ac        AC-US010-04
   * @subtask   ST-ADM01-010-BE-06
   * In plain words: the Administrator role cannot lose a protected right, be made Inactive or Draft, or be deactivated.
   */
  it('protects the Administrator role', async () => {
    const admin = SIX_ROLES.find((r) => r.code === 'ADMINISTRATOR') as (typeof SIX_ROLES)[number];
    const keep = { name: admin.name, description: 'd', status: RoleStatus.ACTIVE };
    await expect(service.update(admin.id, keep, [{ permissionKey: 'users.manage', allowed: false, scope: null }], 'a', 'r')).rejects.toBeInstanceOf(RoleLockedException);
    await expect(service.update(admin.id, { ...keep, status: RoleStatus.INACTIVE }, null, 'a', 'r')).rejects.toBeInstanceOf(RoleLockedException);
    await expect(service.update(admin.id, { ...keep, status: RoleStatus.DRAFT }, null, 'a', 'r')).rejects.toBeInstanceOf(RoleLockedException);
    await expect(service.deactivate(admin.id, 'a', 'r')).rejects.toBeInstanceOf(RoleLockedException);
    expect(roles.updated).toEqual([]);
    await expect(service.update(admin.id, keep, [{ permissionKey: 'users.view', allowed: false, scope: null }], 'a', 'r')).resolves.toBeDefined();
  });

  /**
   * @tc        TC-ADM01-010-J04
   * @story     US-ADM01-010
   * @ac        AC-US010-04
   * @subtask   ST-ADM01-010-BE-06
   * In plain words: only a custom role can be renamed; a standard role keeps its SOW name (decision L-10).
   */
  it('lets a custom role be renamed and keeps the name of a standard role', async () => {
    const custom = roleRecord({ id: 'c-1', name: 'Reviewer' });
    roles.roles.push(custom);
    await expect(service.update('c-1', { ...fields, name: 'Reviewer 2' }, null, 'a', 'r')).resolves.toBeDefined();
    await expect(service.update('std-0', { ...fields, name: 'Initiators' }, null, 'a', 'r')).rejects.toBeInstanceOf(RoleLockedException);
    await expect(service.update('std-0', { ...fields, name: 'Initiator' }, null, 'a', 'r')).resolves.toBeDefined();
  });

  /**
   * @tc        TC-ADM01-010-J05
   * @story     US-ADM01-010
   * @ac        AC-US010-05
   * @subtask   ST-ADM01-010-BE-06
   * In plain words: a role that users hold gives ROLE_IN_USE with the count; a role nobody holds becomes Inactive.
   */
  it('deactivates only a role that nobody holds', async () => {
    roles.holders['std-1'] = 3;
    await expect(service.deactivate('std-1', 'a', 'r')).rejects.toMatchObject({ code: 'ROLE_IN_USE', userCount: 3 });
    await expect(service.deactivate('std-1', 'a', 'r')).rejects.toBeInstanceOf(RoleInUseException);
    expect(roles.statusSet).toEqual([]);
    const done = await service.deactivate('std-2', 'a', 'r');
    expect(done.status).toBe(RoleStatus.INACTIVE);
    expect(roles.statusSet).toEqual([{ roleId: 'std-2', status: RoleStatus.INACTIVE }]);
  });

  /**
   * @tc        TC-ADM01-010-J06
   * @story     US-ADM01-010
   * @ac        AC-US010-06
   * @subtask   ST-ADM01-010-BE-06
   * In plain words: every save writes one audit record with the actor, the before and after, and the reason.
   */
  it('saves the actor, before, after and reason in the audit trail', async () => {
    await service.update('std-0', { ...fields, name: 'Initiator' }, null, 'actor-9', 'policy change');
    expect(audit.recordChange).toHaveBeenCalledTimes(1);
    expect(audit.recordChange).toHaveBeenCalledWith(
      expect.objectContaining({ actor: 'actor-9', entity: 'Role', entityKey: 'std-0', reason: 'policy change', before: expect.anything(), after: expect.anything() }),
    );
  });

  /**
   * @tc        TC-ADM01-010-J07
   * @story     US-ADM01-010
   * @ac        AC-US010-07
   * @subtask   ST-ADM01-010-BE-06
   * In plain words: the list holds the six SOW roles and no role for a position on a proposal.
   */
  it('has no role for a position on a proposal', async () => {
    const names = (await service.list({})).map((r) => r.name);
    for (const position of ['First Processor', 'Second Processor', 'Terminator', 'Discussion participant', 'AWI assignee']) expect(names).not.toContain(position);
    expect(names.sort()).toEqual(['Administrator', 'Auditor', 'Finance', 'Initiator', 'Processor', 'Report Viewer']);
  });
});
