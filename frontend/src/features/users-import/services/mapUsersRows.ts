/**
 * @file    mapUsersRows.ts
 * @module  UsersImport
 *
 * @description
 * Turns raw rows into user inputs. In plain words: finds the department, designation, company and role names in the lists, fills Valid from with today when empty, reports a code or e-mail used twice in the file, and turns the server problems into table lines.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/services/mapUsersRows.ts
 * @lld-synced     v0.30
 * @status         built
 */

import type { UserFormData } from '@/features/users/types/user.types';
import type { Column, ImportRow, MappedFile, Problem, RawRow, Reference, ServerProblem } from '../types/import.types';

const FIELD_COLUMN: Record<string, Column> = {
  employeeCode: 'Employee code',
  fullName: 'Full name',
  email: 'E-mail',
  mobile: 'Mobile',
  departmentId: 'Department code',
  designationId: 'Designation code',
  reportingManagerCode: 'Reporting manager code',
  signIn: 'Sign-in type',
  companies: 'Role names',
  'companies.0.companyCode': 'Company code',
  'companies.0.roleIds': 'Role names',
  'companies.0.validFrom': 'Valid from',
  'companies.0.validTo': 'Valid to',
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (s: string): boolean => DATE.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
const same = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

/** Maps one row; returns the input or null, and adds its problems. */
function mapRow(r: RawRow, ref: Reference, today: string, problems: Problem[]): UserFormData | null {
  const c = r.cells;
  const before = problems.length;
  const add = (column: Column, message: string) => problems.push({ excelRow: r.excelRow, column, value: c[column], message });
  const department = ref.departments.find((d) => same(d.code, c['Department code']));
  if (!department) add('Department code', c['Department code'] ? `No department with code ${c['Department code']}` : 'Enter the department code');
  const designation = ref.designations.find((d) => same(d.code, c['Designation code']));
  if (!designation) add('Designation code', c['Designation code'] ? `No designation with code ${c['Designation code']}` : 'Enter the designation code');
  const signIn = c['Sign-in type'].toUpperCase();
  if (signIn !== 'SSO' && signIn !== 'LOCAL') add('Sign-in type', 'Sign-in type must be SSO or LOCAL');
  const company = ref.companies.find((x) => same(x.code, c['Company code']));
  if (!company) add('Company code', c['Company code'] ? `No company with code ${c['Company code']}` : 'Enter the company code');
  const names = c['Role names'].split(/[,;]/).map((n) => n.trim()).filter(Boolean);
  if (names.length === 0) add('Role names', 'Enter at least one role');
  const roleIds = names.flatMap((n) => {
    const role = ref.roles.find((x) => same(x.name, n));
    if (!role) add('Role names', `No role named ${n}`);
    return role ? [role.roleId] : [];
  });
  const validFrom = c['Valid from'] || today;
  if (!isDate(validFrom)) add('Valid from', 'Enter the date as YYYY-MM-DD');
  if (c['Valid to'] && !isDate(c['Valid to'])) add('Valid to', 'Enter the date as YYYY-MM-DD');
  if (problems.length > before || !department || !designation || !company) return null;
  return {
    employeeCode: c['Employee code'],
    fullName: c['Full name'],
    email: c['E-mail'],
    ...(c.Mobile ? { mobile: c.Mobile } : {}),
    departmentId: department.id,
    designationId: designation.id,
    reportingManagerCode: c['Reporting manager code'] || null,
    signIn: signIn as 'SSO' | 'LOCAL',
    companies: [{ companyCode: company.code, roleIds, validFrom, ...(c['Valid to'] ? { validTo: c['Valid to'] } : {}) }],
  };
}

/** A code or e-mail used twice in the file: the later row gets the problem (the first row wins, even when it was left out for another reason). */
function repeats(raw: RawRow[]): Problem[] {
  const first = { code: new Map<string, number>(), email: new Map<string, number>() };
  const out: Problem[] = [];
  for (const r of raw) {
    const code = r.cells['Employee code'];
    const email = r.cells['E-mail'].toLowerCase();
    const seenCode = code ? first.code.get(code) : undefined;
    const seenEmail = email ? first.email.get(email) : undefined;
    if (seenCode === undefined) first.code.set(code, r.excelRow);
    else out.push({ excelRow: r.excelRow, column: 'Employee code', value: code, message: `The employee code is used twice in the file (rows ${seenCode} and ${r.excelRow})` });
    if (seenEmail === undefined) first.email.set(email, r.excelRow);
    else out.push({ excelRow: r.excelRow, column: 'E-mail', value: r.cells['E-mail'], message: `The e-mail is used twice in the file (rows ${seenEmail} and ${r.excelRow})` });
  }
  return out;
}

/**
 * Maps the rows.
 *
 * In plain words: a row with any problem is left out and its problems are listed; the first of two rows with the same code or e-mail wins.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-04
 * @ac       AC-US009-03
 * @param file - the rows of the file
 * @param ref - the lists to look names up in
 * @param today - YYYY-MM-DD, the default of Valid from
 * @returns The rows that can be sent and the problems of the others
 */
export function mapUsersRows(file: RawRow[], ref: Reference, today: string): MappedFile {
  const raw = file.map((r) => ({ excelRow: r.excelRow, cells: Object.fromEntries(Object.entries(r.cells).map(([k, v]) => [k, v.trim()])) as Record<Column, string> }));
  const repeated = repeats(raw);
  const rows: ImportRow[] = [];
  const problems: Problem[] = [];
  for (const r of raw) {
    const own: Problem[] = [];
    const input = mapRow(r, ref, today, own);
    const dup = repeated.filter((p) => p.excelRow === r.excelRow);
    problems.push(...dup, ...own);
    if (input && dup.length === 0) rows.push({ excelRow: r.excelRow, cells: r.cells, input });
  }
  return { total: raw.length, rows, problems };
}

/**
 * Server problems to table lines.
 *
 * In plain words: the server says row 3 of the list and field `email`; the table needs the Excel row, the column name and the value.
 *
 * @param failed - the problems of one call
 * @param rows - the rows of the whole file that were sent, in order
 * @param offset - the position of the first row of this call in `rows`
 * @returns Problem lines
 */
export function problemsFromServer(failed: ServerProblem[], rows: ImportRow[], offset: number): Problem[] {
  return failed.flatMap((f) => {
    const row = rows[offset + f.row - 1];
    const column = FIELD_COLUMN[f.field];
    return row ? [{ excelRow: row.excelRow, column: column ?? 'Row', value: column ? row.cells[column] : '', message: f.message }] : [];
  });
}
