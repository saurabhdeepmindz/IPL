/**
 * @file    users-bulk-create.spec.ts
 * @module  UsersModule
 *
 * @description
 * Unit tests of the bulk create used by the import (Jest). Written before the code (TDD). The import has no HTTP route yet (it is an internal call, TBD-ADM01-03), so its contract and API cases are tested here (decision L-57). Fakes replace the repositories, the masters port, the one-time password service and the audit service.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-01
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/users-bulk-create.spec.ts
 * @lld-synced     v0.24
 * @status         built
 */

import { BulkImportFailedException } from '../errors/bulk-import-failed.exception';
import { FakeCommandReads, FakeCommandWrites, FakeMasters, validInput } from './command.fakes';
import { FakeOtpService } from './otp.fakes';
import { UserInputValidator } from './user-input-validator';
import { UsersCommandService } from './users-command.service';

describe('Unit tests of the bulk create used by the import (Jest)', () => {
  let writes: FakeCommandWrites;
  let otp: FakeOtpService;
  let audit: { recordChange: jest.Mock };
  let issuedAfterSaves: number[];
  let service: UsersCommandService;
  const row = (n: number, over: object = {}) => validInput({ employeeCode: `2${String(n).padStart(4, '0')}`, email: `bulk${n}@example.invalid`, ...over });

  beforeEach(() => {
    const reads = new FakeCommandReads();
    writes = new FakeCommandWrites();
    otp = new FakeOtpService();
    issuedAfterSaves = [];
    const issue = otp.issue.bind(otp);
    otp.issue = async (user) => {
      issuedAfterSaves.push(writes.created.length);
      return issue(user);
    };
    audit = { recordChange: jest.fn().mockResolvedValue('audit-1') };
    const validator = new UserInputValidator(new FakeMasters() as never, reads as never);
    service = new UsersCommandService(reads as never, writes as never, validator, otp as never, audit as never);
  });

  /**
   * @tc        TC-ADM01-009-C09
   * @story     US-ADM01-009
   * @ac        AC-US009-01
   * @subtask   ST-ADM01-009-IN-01
   * In plain words: contract: good rows are created and bad rows are reported with row, field and message; one bad row does not stop the others.
   */
  it('C09 creates the good rows and reports the bad ones', async () => {
    const out = await service.bulkCreate([row(1), row(2, { fullName: '' }), row(3, { signIn: 'SSO' })], 'actor-1', '10001');
    expect(out).toEqual({ created: 2, failed: [{ row: 2, field: 'fullName', message: expect.any(String) }] });
    expect(writes.created.map((c) => c.data.employeeCode)).toEqual(['20001', '20003']);
    expect(writes.created[0].assignments).toEqual([{ companyCode: 'IPL', roleId: 'role-1', validFrom: new Date('2026-12-01'), validTo: null, assignedBy: '10001' }]);
    const many = await service.bulkCreate([row(4, { fullName: '', email: 'bad' }), row(5)], 'actor-1', '10001');
    expect(many.created).toBe(1);
    expect(many.failed.map((f) => `${f.row}:${f.field}`).sort()).toEqual(['1:email', '1:fullName']);
  });

  /**
   * @tc        TC-ADM01-009-P01
   * @story     US-ADM01-009
   * @ac        AC-US009-01
   * @subtask   ST-ADM01-009-IN-01
   * In plain words: a row that repeats a code (in the file or the database) fails alone; with no valid row nothing is created and the report is returned.
   */
  it('P01 reports a repeated code and refuses a file with no valid row', async () => {
    const out = await service.bulkCreate([row(1), row(2, { employeeCode: '20001' }), row(3, { employeeCode: '30001' }), row(4, { email: 'EXISTING@example.invalid' }), row(5, { email: 'bulk1@example.invalid' })], 'actor-1', '10001');
    expect(out.created).toBe(1);
    expect(out.failed.map((f) => `${f.row}:${f.field}`)).toEqual(['2:employeeCode', '3:employeeCode', '4:email', '5:email']);
    expect(writes.created).toHaveLength(1);
    writes.created = [];
    audit.recordChange.mockClear();
    otp.issued = [];
    const err = await service.bulkCreate([row(6, { fullName: '' }), row(7, { employeeCode: '30001' })], 'actor-1', '10001').then(() => null, (e: BulkImportFailedException) => e);
    expect(err).toBeInstanceOf(BulkImportFailedException);
    expect(err?.fields.map((f) => f.field)).toEqual(['rows.1.fullName', 'rows.2.employeeCode']);
    await expect(service.bulkCreate([], 'actor-1', '10001')).rejects.toBeInstanceOf(BulkImportFailedException);
    expect(writes.created).toHaveLength(0);
    expect(audit.recordChange).not.toHaveBeenCalled();
    expect(otp.issued).toHaveLength(0);
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-01
   * @subtask ST-ADM01-009-IN-01
   * In plain words: supporting test. The one-time passwords go out after every row is saved, only to local users; a failed e-mail does not undo a save; each created user has one audit record "Excel import" without a password.
   */
  it('sends the one-time passwords after saving and audits each created user', async () => {
    otp.answer = 'FAILED';
    const out = await service.bulkCreate([row(1), row(2, { signIn: 'SSO' }), row(3)], 'actor-1', '10001');
    expect(out.created).toBe(3);
    expect(otp.issued.map((i) => i.email)).toEqual(['bulk1@example.invalid', 'bulk3@example.invalid']);
    expect(issuedAfterSaves).toEqual([3, 3]);
    expect(audit.recordChange).toHaveBeenCalledTimes(3);
    expect(audit.recordChange).toHaveBeenCalledWith(expect.objectContaining({ actor: 'actor-1', entity: 'User', reason: 'Excel import' }));
    expect(JSON.stringify(audit.recordChange.mock.calls)).not.toMatch(/password/i);
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-01
   * @subtask ST-ADM01-009-IN-01
   * In plain words: supporting test. When saving one row fails (two saves at once, or an unknown role), only that row is reported and the others are saved.
   */
  it('reports a row whose save fails and keeps the others', async () => {
    jest.spyOn(writes, 'create').mockRejectedValueOnce({ code: 'P2002', meta: { target: ['email'] } }).mockRejectedValueOnce({ code: 'P2003' });
    const out = await service.bulkCreate([row(1), row(2), row(3)], 'actor-1', '10001');
    expect(out.created).toBe(1);
    expect(out.failed.map((f) => `${f.row}:${f.field}`)).toEqual(['1:email', '2:companies']);
    expect(audit.recordChange).toHaveBeenCalledTimes(1);
  });
});
