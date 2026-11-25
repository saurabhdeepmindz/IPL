/**
 * @file    users-command.service.ts
 * @module  UsersModule
 *
 * @description
 * Creating and changing users. In plain words: saves a new user with company roles, changes a user, and creates many users for the import. Rules are checked first; every change is audited.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003, US-ADM01-009
 * @subtask        ST-ADM01-003-BE-03, ST-ADM01-009-IN-01
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/users-command.service.ts
 * @lld-synced     v0.21
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { AuditService } from '@libs/audit';
import { FieldError, ValidationFailedException } from '@libs/common';
import { NewUser, UserRecord, UserRepository } from '../repositories/user';
import { UserWriteRepository } from '../repositories/user-write';
import { DuplicateEmailException } from '../errors/duplicate-email.exception';
import { DuplicateEmployeeCodeException } from '../errors/duplicate-employee-code.exception';
import { EmployeeCodeReadOnlyException } from '../errors/employee-code-read-only.exception';
import { UnknownUserException } from '../errors/unknown-user.exception';
import { BulkImportFailedException } from '../errors/bulk-import-failed.exception';
import { auditFields, toAssignments, toNewUser, translateWriteError, writeProblems } from './user-command-helpers';
import { OneTimePasswordService } from './one-time-password.service';
import { UserInput, UserInputValidator } from './user-input-validator';

/** The answer of a create. */
export interface CreateResult {
  employeeCode: string;
  status: 'ACTIVE';
  oneTimePassword: { required: boolean; emailStatus: 'SENT' | 'FAILED' | null };
}

/** One saved row of an import. */
interface SavedRow {
  id: string;
  email: string;
  fullName: string;
  authType: 'SSO' | 'LOCAL';
  data: NewUser;
}

/** The answer of an import. */
export interface BulkResult {
  created: number;
  failed: Array<{ row: number; field: string; message: string }>;
}

/**
 * Users command service.
 *
 * In plain words: the rules of creating and changing users.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003, US-ADM01-009
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7, FR-042.2
 *   contracts: API-USR-02, API-USR-04, API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.21 section 6.1
 */
@Injectable()
export class UsersCommandService {
  constructor(
    private readonly users: UserRepository,
    private readonly writes: UserWriteRepository,
    private readonly validator: UserInputValidator,
    private readonly passwords: OneTimePasswordService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Creates a user.
   *
   * In plain words: checks every field, refuses a used code or e-mail, saves the user and company roles together, sends the one-time password to a local user, and audits it.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-03
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02
 * @ac        AC-US003-01, AC-US003-02, AC-US003-05
 * @lld       LLD-EPIC-ADM-01 v0.21 §6.1
 * @status    built
   *
   * @dependencies UserInputValidator.validate, UserRepository.findByCode, findByEmail, UserWriteRepository.create, OneTimePasswordService.issue, AuditService.recordChange
   *
   * @param input - the user fields
   * @param actor - user key of the caller (audit)
   * @param assignedBy - employee code of the caller (role rows)
   * @returns The employee code, status ACTIVE and the one-time password status
   * @throws ValidationFailedException - every field problem (HTTP 422)
   * @throws DuplicateEmployeeCodeException (HTTP 409)
   * @throws DuplicateEmailException (HTTP 409)
   */
  async create(input: UserInput, actor: string, assignedBy: string): Promise<CreateResult> {
    await this.check(input);
    if (await this.users.findByCode(input.employeeCode)) throw new DuplicateEmployeeCodeException();
    if (await this.users.findByEmail(input.email)) throw new DuplicateEmailException();
    const data = toNewUser(input, await this.managerId(input.reportingManagerCode));
    const saved = await this.writes.create(data, toAssignments(input, assignedBy)).catch((err) => {
      throw translateWriteError(err);
    });
    const required = input.signIn === 'LOCAL';
    const emailStatus = required ? await this.passwords.issue({ id: saved.id, email: saved.email, fullName: saved.fullName }) : null;
    await this.audit.recordChange({ actor, entity: 'User', entityKey: saved.id, after: auditFields(data), reason: 'Created' });
    return { employeeCode: saved.employeeCode, status: 'ACTIVE', oneTimePassword: { required, emailStatus } };
  }

  /**
   * Changes a user.
   *
   * In plain words: the same checks as create, plus the employee code can be corrected only until the first sign-in.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-03
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-04
 * @ac        AC-US003-04, AC-US003-05
 * @lld       LLD-EPIC-ADM-01 v0.21 §6.1
 * @status    built
   *
   * @dependencies UserInputValidator.validate, UserRepository.findByCode, findByEmail, update, AuditService.recordChange
   *
   * @param employeeCode - the user to change
   * @param input - the whole record; `newEmployeeCode` renames
   * @param actor - user key (audit)
   * @param assignedBy - employee code (role rows)
   * @returns The updated user
   * @throws UnknownUserException (HTTP 404)
   * @throws EmployeeCodeReadOnlyException - `newEmployeeCode` sent after the first sign-in (HTTP 422)
   * @throws ValidationFailedException, DuplicateEmployeeCodeException, DuplicateEmailException
   */
  async update(employeeCode: string, input: UserInput, actor: string, assignedBy: string): Promise<UserRecord> {
    const before = await this.users.findByCode(employeeCode);
    if (!before) throw new UnknownUserException();
    const renamed = input.newEmployeeCode !== undefined && input.newEmployeeCode !== employeeCode;
    if (renamed && before.firstSignInAt) throw new EmployeeCodeReadOnlyException();
    await this.check(input);
    if (renamed && (await this.users.findByCode(input.newEmployeeCode as string))) throw new DuplicateEmployeeCodeException();
    const sameEmail = await this.users.findByEmail(input.email);
    if (sameEmail && sameEmail.id !== before.id) throw new DuplicateEmailException();
    const data = toNewUser(input, await this.managerId(input.reportingManagerCode));
    const saved = await this.writes
      .update(employeeCode, { ...data, employeeCode: undefined, ...(renamed ? { newEmployeeCode: input.newEmployeeCode } : {}) }, toAssignments(input, assignedBy))
      .catch((err) => {
        throw translateWriteError(err);
      });
    const was = { employeeCode, fullName: before.fullName, email: before.email, companies: before.companies };
    await this.audit.recordChange({ actor, entity: 'User', entityKey: before.id, before: was, after: auditFields({ ...data, employeeCode: input.newEmployeeCode ?? employeeCode }), reason: 'Changed' });
    return saved;
  }

  /**
   * Creates many users.
   *
   * In plain words: for the Excel import: each row is checked with the same rules, good rows are saved, bad rows are reported, one-time passwords go out after saving.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-009
 * @subtask   ST-ADM01-009-IN-01
 * @frd       FR-042.2
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-09
 * @ac        AC-US009-01
 * @lld       LLD-EPIC-ADM-01 v0.21 §6.1
 * @status    built
   *
   * @dependencies UserInputValidator.validate, UserRepository.findByCode, findByEmail, UserWriteRepository.create, OneTimePasswordService.issue, AuditService.recordChange
   *
   * @param rows - the validated import rows
   * @param actor - user key (audit)
   * @param assignedBy - employee code (role rows)
   * @returns How many were created and the failed rows
   * @throws BulkImportFailedException - no row is valid (HTTP 422, with the error report)
   */
  async bulkCreate(rows: UserInput[], actor: string, assignedBy: string): Promise<BulkResult> {
    const failed: BulkResult['failed'] = [];
    const made: SavedRow[] = [];
    const seen = { codes: new Set<string>(), emails: new Set<string>() };
    for (const [i, input] of rows.entries()) {
      const problems = await this.rowProblems(input, seen);
      const saved = problems.length === 0 ? await this.saveRow(input, assignedBy).catch((err) => (problems.push(...writeProblems(err)), null)) : null;
      if (saved) made.push(saved);
      failed.push(...problems.map((p) => ({ row: i + 1, field: p.field, message: p.message })));
    }
    if (made.length === 0) throw new BulkImportFailedException(failed.map((f) => ({ field: `rows.${f.row}.${f.field}`, message: f.message })));
    await this.finishImport(made, actor);
    return { created: made.length, failed };
  }

  /** Every problem of one row: the rules of one user, a code or e-mail repeated earlier in the file, or already used in the database (decision L-56). */
  private async rowProblems(input: UserInput, seen: { codes: Set<string>; emails: Set<string> }): Promise<FieldError[]> {
    const problems = await this.validator.validate(input);
    const email = input.email?.toLowerCase() ?? '';
    const inFile = { code: seen.codes.has(input.employeeCode), email: seen.emails.has(email) };
    seen.codes.add(input.employeeCode);
    seen.emails.add(email);
    const known = { code: inFile.code || !!(await this.users.findByCode(input.employeeCode)), email: inFile.email || !!(await this.users.findByEmail(input.email)) };
    if (known.code) problems.push({ field: 'employeeCode', message: 'The employee code is already used' });
    if (known.email) problems.push({ field: 'email', message: 'The e-mail is already used' });
    return problems;
  }

  /** Saves one good row in its own transaction. */
  private async saveRow(input: UserInput, assignedBy: string): Promise<SavedRow> {
    const data = toNewUser(input, await this.managerId(input.reportingManagerCode));
    const user = await this.writes.create(data, toAssignments(input, assignedBy));
    return { id: user.id, email: user.email, fullName: user.fullName, authType: data.authType, data };
  }

  /** After all rows: the one-time password of each new local user (a failed e-mail does not undo a save), and one audit record per created user. */
  private async finishImport(made: SavedRow[], actor: string): Promise<void> {
    for (const u of made.filter((m) => m.authType === 'LOCAL')) await this.passwords.issue({ id: u.id, email: u.email, fullName: u.fullName });
    for (const u of made) await this.audit.recordChange({ actor, entity: 'User', entityKey: u.id, after: auditFields(u.data), reason: 'Excel import' });
  }

  /** Throws one answer with every field problem when the input breaks a rule. */
  private async check(input: UserInput): Promise<void> {
    const problems = await this.validator.validate(input);
    if (problems.length > 0) throw new ValidationFailedException(problems);
  }

  /** The key of the reporting manager (already checked by the validator), or null. */
  private async managerId(code: string | null): Promise<string | null> {
    return code ? ((await this.users.findByCode(code))?.id ?? null) : null;
  }
}
