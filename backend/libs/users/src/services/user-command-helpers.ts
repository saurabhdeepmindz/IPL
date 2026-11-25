/**
 * @file    user-command-helpers.ts
 * @module  UsersModule
 *
 * @description
 * Small helpers of the user command service. In plain words: turns the call's input into the rows the repository writes, and turns a database clash into the right 409 or 422 answer.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/user-command-helpers.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { FieldError, ValidationFailedException } from '@libs/common';
import { DuplicateEmailException } from '../errors/duplicate-email.exception';
import { DuplicateEmployeeCodeException } from '../errors/duplicate-employee-code.exception';
import { NewUser, UserAssignment, UserRepository } from '../repositories/user';
import { UserInput, UserInputValidator } from './user-input-validator';

/** One assignment row per company and role of the input. */
export function toAssignments(input: UserInput, assignedBy: string): UserAssignment[] {
  return input.companies.flatMap((c) => c.roleIds.map((roleId) => ({ companyCode: c.companyCode, roleId, validFrom: c.validFrom, validTo: c.validTo ?? null, assignedBy })));
}

/** The user row fields of an input; the reporting manager is already resolved to its key. */
export function toNewUser(input: UserInput, reportingManagerId: string | null): NewUser {
  return {
    employeeCode: input.employeeCode,
    fullName: input.fullName.trim(),
    email: input.email,
    mobile: input.mobile ?? null,
    departmentId: input.departmentId,
    designationId: input.designationId,
    reportingManagerId,
    authType: input.signIn,
  };
}

/** The fields an audit record shows (never a password). */
export function auditFields(user: NewUser): Record<string, unknown> {
  const { employeeCode, fullName, email, mobile, departmentId, designationId, reportingManagerId, authType } = user;
  return { employeeCode, fullName, email, mobile, departmentId, designationId, reportingManagerId, authType };
}

/** The codes and e-mails already met in one list of rows. */
export interface SeenRows {
  codes: Set<string>;
  emails: Set<string>;
}

/**
 * Every problem of one row.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-03
 * In plain words: the rules of one user, a code or e-mail repeated earlier in the list, or already used in the database (decision L-56). One function serves the check and the import.
 *
 * @param validator - the rules of one user
 * @param users - the user lookups
 * @param input - the row
 * @param seen - the codes and e-mails of the earlier rows (this call adds the row's own)
 * @returns The field problems (empty when the row is good)
 */
export async function rowProblems(validator: UserInputValidator, users: UserRepository, input: UserInput, seen: SeenRows): Promise<FieldError[]> {
  const problems = await validator.validate(input);
  const email = input.email?.toLowerCase() ?? '';
  const inFile = { code: seen.codes.has(input.employeeCode), email: seen.emails.has(email) };
  seen.codes.add(input.employeeCode);
  seen.emails.add(email);
  const known = { code: inFile.code || !!(await users.findByCode(input.employeeCode)), email: inFile.email || !!(await users.findByEmail(input.email)) };
  if (known.code) problems.push({ field: 'employeeCode', message: 'The employee code is already used' });
  if (known.email) problems.push({ field: 'email', message: 'The e-mail is already used' });
  return problems;
}

/** Turns a database clash (two saves at once, or an unknown role) into the answer the caller expects. Other errors pass through. */
export function translateWriteError(err: unknown): unknown {
  const e = err as { code?: string; meta?: { target?: string | string[] } };
  if (e?.code === 'P2002') {
    const target = [e.meta?.target ?? []].flat().join(',');
    return target.includes('email') ? new DuplicateEmailException() : new DuplicateEmployeeCodeException();
  }
  if (e?.code === 'P2003') return new ValidationFailedException([{ field: 'companies', message: 'A chosen role does not exist' }]);
  return err;
}

/** The problems of one import row whose save failed: the field and message of a known error, or a general message. */
export function writeProblems(err: unknown): FieldError[] {
  const e = translateWriteError(err);
  if (e instanceof DuplicateEmailException) return [{ field: 'email', message: e.message }];
  if (e instanceof DuplicateEmployeeCodeException) return [{ field: 'employeeCode', message: e.message }];
  if (e instanceof ValidationFailedException) return e.fields;
  return [{ field: 'row', message: 'The row could not be saved' }];
}
