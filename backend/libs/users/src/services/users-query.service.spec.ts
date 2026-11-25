/**
 * @file    users-query.service.spec.ts
 * @module  UsersModule
 *
 * @description
 * Unit tests of the users query service (Jest). Written before the code (TDD); fakes replace the repository and the audit service. In plain words: shows that the user list is read for the right company, with counts, and that ALL companies is audited.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-001, US-ADM01-003
 * @subtask        ST-ADM01-001-BE-04, ST-ADM01-003-BE-06
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/users-query.service.spec.ts
 * @lld-synced     v0.21
 * @status         built
 */

import { ListContext, ListInput, UsersQueryService } from './users-query.service';
import { FakeUserReads, userRecord } from './users.fakes';

const input = (over: Partial<ListInput> = {}): ListInput => ({ page: 1, pageSize: 25, sort: 'name:asc', ...over });
const ctx = (over: Partial<ListContext> = {}): ListContext => ({ sessionCompany: 'IPL', allCompanies: false, actor: 'actor-1', ...over });

describe('UsersQueryService.search', () => {
  let users: FakeUserReads;
  let audit: { recordChange: jest.Mock };
  let service: UsersQueryService;

  beforeEach(() => {
    users = new FakeUserReads();
    audit = { recordChange: jest.fn().mockResolvedValue('audit-1') };
    service = new UsersQueryService(users as never, audit as never);
  });

  /**
   * @tc        TC-ADM01-001-J01
   * @story     US-ADM01-001
   * @ac        AC-US001-01
   * @subtask   ST-ADM01-001-BE-04
   * In plain words: only the session company is read, and the answer has the page, the total and the counts of the four tabs.
   */
  it('lists the session company with counts', async () => {
    users.rows = [userRecord({ employeeCode: '10001' }), userRecord({ employeeCode: '10002', status: 'INACTIVE' })];
    users.counts = { ACTIVE: 5, INACTIVE: 2, LOCKED: 1 };
    const out = await service.search(input(), ctx());
    expect(users.pageCalls[0].filter.companyCode).toBe('IPL');
    expect(out.items).toHaveLength(2);
    expect(out).toMatchObject({ counts: { all: 8, active: 5, inactive: 2, locked: 1 }, page: 1, pageSize: 25, total: 2 });
  });

  /**
   * @tc        TC-ADM01-001-J02
   * @story     US-ADM01-001
   * @ac        AC-US001-02
   * @subtask   ST-ADM01-001-BE-04
   * In plain words: the search word and the filters reach the repository; with no match the list is empty and every count is zero.
   */
  it('searches and filters, and gives an empty list for no match', async () => {
    users.rows = [];
    users.counts = { ACTIVE: 0, INACTIVE: 0, LOCKED: 0 };
    const out = await service.search(input({ q: 'nobody', departmentId: 'd-1', roleId: 'r-1', signIn: 'LOCAL', status: 'locked' }), ctx());
    expect(users.pageCalls[0].filter).toEqual({ companyCode: 'IPL', status: 'LOCKED', q: 'nobody', departmentId: 'd-1', roleId: 'r-1', signIn: 'LOCAL' });
    expect(out).toMatchObject({ items: [], total: 0, counts: { all: 0, active: 0, inactive: 0, locked: 0 } });
  });

  /**
   * @tc        TC-ADM01-001-J03
   * @story     US-ADM01-001
   * @ac        AC-US001-03
   * @subtask   ST-ADM01-001-BE-04
   * In plain words: when the company guard allowed ALL, every company is read and the use is audited; a normal call writes no audit record.
   */
  it('audits the use of ALL companies', async () => {
    await service.search(input({ q: 'x' }), ctx());
    expect(audit.recordChange).not.toHaveBeenCalled();
    await service.search(input({ q: 'x' }), ctx({ allCompanies: true }));
    expect(users.pageCalls[1].filter.companyCode).toBeNull();
    expect(audit.recordChange).toHaveBeenCalledTimes(1);
    expect(audit.recordChange).toHaveBeenCalledWith(expect.objectContaining({ actor: 'actor-1', entity: 'UserList', entityKey: 'ALL', after: { filters: expect.objectContaining({ q: 'x' }) } }));
  });

  /**
   * @tc        TC-ADM01-001-J04
   * @story     US-ADM01-001
   * @ac        AC-US001-04
   * @subtask   ST-ADM01-001-BE-04
   * In plain words: one page query and one count query, however many users there are (the one second target is measured by pytest).
   */
  it('uses one page query and one count query', async () => {
    users.rows = Array.from({ length: 200 }, (_, n) => userRecord({ employeeCode: String(10000 + n) }));
    await service.search(input({ pageSize: 100 }), ctx());
    expect(users.pageCalls).toHaveLength(1);
    expect(users.countCalls).toHaveLength(1);
  });

  /**
   * @tc        TC-ADM01-001-J05
   * @story     US-ADM01-001
   * @ac        AC-US001-05
   * @subtask   ST-ADM01-001-BE-04
   * In plain words: paging and order reach the repository; the tab "all" asks for no status; the counts ignore the tab.
   */
  it('applies paging, order and the tab', async () => {
    await service.search(input({ page: 3, pageSize: 10, sort: 'employeeCode:desc', status: 'all' }), ctx());
    expect(users.pageCalls[0].paging).toEqual({ page: 3, pageSize: 10, sort: 'employeeCode:desc' });
    expect(users.pageCalls[0].filter.status).toBeUndefined();
    await service.search(input({ status: 'inactive' }), ctx());
    expect(users.pageCalls[1].filter.status).toBe('INACTIVE');
  });
});

describe('UsersQueryService.getDetails (story 003)', () => {
  const when = new Date('2026-11-20T10:00:00Z');
  let audit: { recentChanges: jest.Mock; recordChange: jest.Mock };
  let service: UsersQueryService;
  const both = userRecord({ employeeCode: '10031', id: 'u-both', companies: [{ code: '1000', roles: ['Initiator', 'Processor'] }, { code: '2000', roles: ['Initiator'] }] });
  const locked = userRecord({ employeeCode: '10032', id: 'u-lock', status: 'LOCKED' });
  const reads = { findByCode: async (code: string) => [both, locked].find((u) => u.employeeCode === code) ?? null };

  beforeEach(() => {
    audit = { recentChanges: jest.fn().mockResolvedValue([{ at: when, text: 'Created' }]), recordChange: jest.fn() };
    service = new UsersQueryService(reads as never, audit as never);
  });

  /**
   * @tc        TC-ADM01-003-J03
   * @story     US-ADM01-003
   * @ac        AC-US003-03
   * @subtask   ST-ADM01-003-BE-06
   * In plain words: the details show both companies with their roles, one plain sentence per company, the lock flag and the latest changes; an unknown code gives 404.
   */
  it('J03 shows both companies, the summary sentence, the lock flag and the activity', async () => {
    const out = await service.getDetails('10031');
    expect(out.user.companies).toEqual(both.companies);
    expect(out.summaryText).toBe('Company 1000: Initiator, Processor. Company 2000: Initiator.');
    expect(out.signInLocked).toBe(false);
    expect(out.activity).toEqual([{ at: when, text: 'Created' }]);
    expect(audit.recentChanges).toHaveBeenCalledWith('User', 'u-both', 10);
    expect((await service.getDetails('10032')).signInLocked).toBe(true);
    await expect(service.getDetails('99999')).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
  });

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-03
   * @subtask ST-ADM01-003-BE-06
   * In plain words: supporting test. A user with no company role gets a plain sentence that says so.
   */
  it('says plainly when the user holds no role', async () => {
    const none = userRecord({ employeeCode: '10033', id: 'u-none', companies: [] });
    const svc = new UsersQueryService({ findByCode: async () => none } as never, audit as never);
    expect((await svc.getDetails('10033')).summaryText).toBe('No company role is assigned.');
  });
});
