/**
 * @file    users-command.service.spec.ts
 * @module  UsersModule
 *
 * @description
 * Unit tests of the users command service (Jest). Written before the code (TDD); fakes replace the repositories, the masters port, the one-time password service and the audit service.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-06
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/users-command.service.spec.ts
 * @lld-synced     v0.19
 * @status         built
 */

import { ValidationFailedException } from '@libs/common';
import { DuplicateEmailException } from '../errors/duplicate-email.exception';
import { DuplicateEmployeeCodeException } from '../errors/duplicate-employee-code.exception';
import { EmployeeCodeReadOnlyException } from '../errors/employee-code-read-only.exception';
import { UnknownUserException } from '../errors/unknown-user.exception';
import { FakeCommandReads, FakeCommandWrites, FakeMasters, validInput } from './command.fakes';
import { FakeOtpService } from './otp.fakes';
import { UserInputValidator } from './user-input-validator';
import { UsersCommandService } from './users-command.service';

describe('Unit tests of the users command service (Jest)', () => {
  let reads: FakeCommandReads;
  let writes: FakeCommandWrites;
  let otp: FakeOtpService;
  let audit: { recordChange: jest.Mock };
  let service: UsersCommandService;

  beforeEach(() => {
    reads = new FakeCommandReads();
    writes = new FakeCommandWrites();
    otp = new FakeOtpService();
    audit = { recordChange: jest.fn().mockResolvedValue('audit-1') };
    const validator = new UserInputValidator(new FakeMasters() as never, reads as never);
    service = new UsersCommandService(reads as never, writes as never, validator, otp as never, audit as never);
  });

  const fieldsOf = async (promise: Promise<unknown>): Promise<string[]> => {
    const err = await promise.then(() => null, (e: ValidationFailedException) => e);
    expect(err).toBeInstanceOf(ValidationFailedException);
    return (err as ValidationFailedException).fields.map((f) => f.field);
  };

  /**
   * @tc        TC-ADM01-003-J01
   * @story     US-ADM01-003
   * @ac        AC-US003-01
   * @subtask   ST-ADM01-003-BE-06
   * In plain words: a valid user is created as ACTIVE with its company roles and an audit record; a local user gets a one-time password.
   */
  it('J01 creates a user, audits it and sends the one-time password to a local user', async () => {
    const out = await service.create(validInput(), 'actor-1', '10001');
    expect(out).toEqual({ employeeCode: '20001', status: 'ACTIVE', oneTimePassword: { required: true, emailStatus: 'SENT' } });
    expect(writes.created[0].data).toMatchObject({ employeeCode: '20001', reportingManagerId: 'u-manager', authType: 'LOCAL' });
    expect(writes.created[0].assignments).toEqual([{ companyCode: 'IPL', roleId: 'role-1', validFrom: new Date('2026-12-01'), validTo: null, assignedBy: '10001' }]);
    expect(otp.issued).toEqual([{ id: 'u-new', email: 'new.person@example.invalid', fullName: 'New Person' }]);
    expect(audit.recordChange).toHaveBeenCalledWith(expect.objectContaining({ actor: 'actor-1', entity: 'User', entityKey: 'u-new', reason: 'Created' }));
    expect(JSON.stringify(audit.recordChange.mock.calls[0][0])).not.toMatch(/password/i);
    otp.issued = [];
    const sso = await service.create(validInput({ employeeCode: '20002', email: 'sso@example.invalid', signIn: 'SSO' }), 'actor-1', '10001');
    expect(sso.oneTimePassword).toEqual({ required: false, emailStatus: null });
    expect(otp.issued).toHaveLength(0);
  });

  /**
   * @tc        TC-ADM01-003-J02
   * @story     US-ADM01-003
   * @ac        AC-US003-02
   * @subtask   ST-ADM01-003-BE-06
   * In plain words: an employee code or e-mail that exists gives 409 and nothing is saved.
   */
  it('J02 refuses a duplicate code or e-mail', async () => {
    await expect(service.create(validInput({ employeeCode: '30001' }), 'a', '10001')).rejects.toBeInstanceOf(DuplicateEmployeeCodeException);
    await expect(service.create(validInput({ email: 'EXISTING@example.invalid' }), 'a', '10001')).rejects.toBeInstanceOf(DuplicateEmailException);
    expect(writes.created).toHaveLength(0);
    expect(audit.recordChange).not.toHaveBeenCalled();
    expect(otp.issued).toHaveLength(0);
  });

  /**
   * @tc        TC-ADM01-003-J04
   * @story     US-ADM01-003
   * @ac        AC-US003-04
   * @subtask   ST-ADM01-003-BE-06
   * In plain words: a new employee code is saved before the first sign-in and refused after it.
   */
  it('J04 lets the code change only before the first sign-in', async () => {
    const before = validInput({ employeeCode: '30001', newEmployeeCode: '30009', email: 'existing@example.invalid' });
    await service.update('30001', before, 'actor-1', '10001');
    expect(writes.updated[0]).toMatchObject({ code: '30001', data: expect.objectContaining({ newEmployeeCode: '30009' }) });
    expect(audit.recordChange).toHaveBeenCalledWith(expect.objectContaining({ entity: 'User', reason: 'Changed' }));
    audit.recordChange.mockClear();
    const after = validInput({ employeeCode: '30002', newEmployeeCode: '30008', email: 'signed@example.invalid' });
    await expect(service.update('30002', after, 'actor-1', '10001')).rejects.toBeInstanceOf(EmployeeCodeReadOnlyException);
    expect(writes.updated).toHaveLength(1);
    expect(audit.recordChange).not.toHaveBeenCalled();
    await expect(service.update('99999', validInput({ employeeCode: '99999' }), 'a', '10001')).rejects.toBeInstanceOf(UnknownUserException);
  });

  /**
   * @tc        TC-ADM01-003-J05
   * @story     US-ADM01-003
   * @ac        AC-US003-05
   * @subtask   ST-ADM01-003-BE-06
   * In plain words: the highest designation may have no reporting manager; any other designation needs one.
   */
  it('J05 applies the reporting manager rule', async () => {
    expect(await fieldsOf(service.create(validInput({ reportingManagerCode: null }), 'a', '10001'))).toEqual(['reportingManagerCode']);
    const top = await service.create(validInput({ designationId: 'desig-top', reportingManagerCode: null }), 'a', '10001');
    expect(top.status).toBe('ACTIVE');
    expect(writes.created[0].data.reportingManagerId).toBeNull();
    expect(await fieldsOf(service.create(validInput({ employeeCode: '20003', email: 'x3@example.invalid', reportingManagerCode: '10051' }), 'a', '10001'))).toEqual(['reportingManagerCode']);
    expect(await fieldsOf(service.create(validInput({ employeeCode: '20004', email: 'x4@example.invalid', reportingManagerCode: '77777' }), 'a', '10001'))).toEqual(['reportingManagerCode']);
  });

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-01
   * @subtask ST-ADM01-003-BE-06
   * In plain words: supporting test. Every field problem is returned together, and nothing is saved.
   */
  it('returns all field problems together', async () => {
    const bad = validInput({ employeeCode: '12', fullName: '', email: 'not-an-email', departmentId: 'nope', designationId: 'nope', companies: [] });
    expect((await fieldsOf(service.create(bad, 'a', '10001'))).sort()).toEqual(['companies', 'departmentId', 'designationId', 'email', 'employeeCode', 'fullName']);
    const twice = validInput({ companies: [
      { companyCode: 'IPL', roleIds: [], validFrom: new Date('2026-12-01') },
      { companyCode: 'IPL', roleIds: ['r'], validFrom: new Date('2026-12-05'), validTo: new Date('2026-12-01') },
    ] });
    expect((await fieldsOf(service.create(twice, 'a', '10001'))).sort()).toEqual(['companies.0.roleIds', 'companies.1.companyCode', 'companies.1.validTo']);
    expect(writes.created).toHaveLength(0);
  });

  /**
   * @story   US-ADM01-003
   * @ac      AC-US003-01
   * @subtask ST-ADM01-003-BE-06
   * In plain words: supporting test. A failed e-mail does not undo the save; and a race on the database's unique rules still gives the 409 answers.
   */
  it('keeps the user when the e-mail fails and maps a database clash to 409', async () => {
    otp.answer = 'FAILED';
    const out = await service.create(validInput(), 'a', '10001');
    expect(out.oneTimePassword).toEqual({ required: true, emailStatus: 'FAILED' });
    expect(writes.created).toHaveLength(1);
    writes.failWith = { code: 'P2002', meta: { target: ['email'] } };
    await expect(service.create(validInput({ employeeCode: '20005', email: 'race@example.invalid' }), 'a', '10001')).rejects.toBeInstanceOf(DuplicateEmailException);
    writes.failWith = { code: 'P2002', meta: { target: ['employee_code'] } };
    await expect(service.create(validInput({ employeeCode: '20006', email: 'race2@example.invalid' }), 'a', '10001')).rejects.toBeInstanceOf(DuplicateEmployeeCodeException);
    writes.failWith = { code: 'P2003' };
    expect(await fieldsOf(service.create(validInput({ employeeCode: '20007', email: 'race3@example.invalid' }), 'a', '10001'))).toEqual(['companies']);
  });

});
