/**
 * @file    users-check-rows.spec.ts
 * @module  UsersModule
 *
 * @description
 * Unit tests of the row check used by the import wizard (Jest). Written before the code (TDD). Fakes replace the repositories, the masters port, the one-time password service and the audit service.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/users-check-rows.spec.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { FakeCommandReads, FakeCommandWrites, FakeMasters, validInput } from './command.fakes';
import { FakeOtpService } from './otp.fakes';
import { UserInputValidator } from './user-input-validator';
import { UsersCommandService } from './users-command.service';

describe('Unit tests of the row check (Jest)', () => {
  let writes: FakeCommandWrites;
  let otp: FakeOtpService;
  let audit: { recordChange: jest.Mock };
  let service: UsersCommandService;
  const row = (n: number, over: object = {}) => validInput({ employeeCode: `2${String(n).padStart(4, '0')}`, email: `check${n}@example.invalid`, ...over });

  beforeEach(() => {
    const reads = new FakeCommandReads();
    writes = new FakeCommandWrites();
    otp = new FakeOtpService();
    audit = { recordChange: jest.fn().mockResolvedValue('audit-1') };
    const validator = new UserInputValidator(new FakeMasters() as never, reads as never);
    service = new UsersCommandService(reads as never, writes as never, validator, otp as never, audit as never);
  });

  /**
   * @tc        TC-ADM01-009-C10
   * @story     US-ADM01-009
   * @ac        AC-US009-03
   * @subtask   ST-ADM01-009-IN-03
   * In plain words: contract: the check gives the same problems as the import for the same rows (row, field, message) and saves nothing: no user, no one-time password, no audit record.
   */
  it('C10 gives the problems of each row and saves nothing', async () => {
    const rows = [row(1), row(2, { fullName: '' }), row(3, { email: 'bad' })];
    const failed = await service.checkRows(rows);
    expect(failed.map((f) => `${f.row}:${f.field}`).sort()).toEqual(['2:fullName', '3:email']);
    const imported = await service.bulkCreate(rows, 'actor-1', '10001');
    expect(imported.failed).toEqual(failed);
    expect(writes.created).toHaveLength(1);
  });

  it('saves, sends and audits nothing', async () => {
    await service.checkRows([row(1), row(2), row(3)]);
    expect(writes.created).toHaveLength(0);
    expect(otp.issued).toHaveLength(0);
    expect(audit.recordChange).not.toHaveBeenCalled();
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-03
   * @subtask ST-ADM01-009-IN-03
   * In plain words: supporting test. A code or e-mail repeated earlier in the list is reported on the later row; a code or e-mail already in the database is reported on its row.
   */
  it('reports a repeated code or e-mail and one already used', async () => {
    const failed = await service.checkRows([row(1), row(2, { employeeCode: '20001' }), row(3, { email: 'check1@example.invalid' }), row(4, { employeeCode: '30001' }), row(5, { email: 'EXISTING@example.invalid' })]);
    expect(failed.map((f) => `${f.row}:${f.field}`)).toEqual(['2:employeeCode', '3:email', '4:employeeCode', '5:email']);
  });

  it('gives no problem for good rows and for an empty list', async () => {
    expect(await service.checkRows([row(1), row(2)])).toEqual([]);
    expect(await service.checkRows([])).toEqual([]);
  });
});
