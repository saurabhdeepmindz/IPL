/**
 * @file    mapUsersRows.test.ts
 * @module  Tests
 *
 * @description
 * Vitest tests of mapping the rows. Written before the code.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users-import/mapUsersRows.test.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { describe, expect, it } from 'vitest';
import { mapUsersRows, problemsFromServer } from '@/features/users-import/services/mapUsersRows';
import type { Column, RawRow, Reference } from '@/features/users-import/types/import.types';

const ref: Reference = {
  departments: [{ id: 'd1', code: 'IT', name: 'Information Technology' }],
  designations: [{ id: 'g1', code: 'SM', name: 'Senior Manager' }, { id: 'g2', code: 'AGM', name: 'AGM', isHighest: true }],
  companies: [{ code: 'IPL', name: 'Indian Potash Limited' }],
  roles: [{ roleId: 'r1', name: 'Initiator' }, { roleId: 'r2', name: 'Auditor' }],
};
const TODAY = '2026-11-26';

const raw = (excelRow: number, over: Partial<Record<Column, string>> = {}): RawRow => ({
  excelRow,
  cells: {
    'Employee code': `2000${excelRow}`, 'Full name': 'Anil Kumar', 'E-mail': `anil${excelRow}@example.invalid`, Mobile: '9876543210', 'Department code': 'IT', 'Designation code': 'SM', 'Reporting manager code': '10001', 'Sign-in type': 'LOCAL', 'Company code': 'IPL', 'Role names': 'Initiator, Auditor', 'Valid from': '', 'Valid to': '', ...over,
  },
});

describe('US-ADM01-009 mapping the rows (supporting tests)', () => {
  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-02
   * @subtask ST-ADM01-009-IN-04
   * In plain words: supporting test. Names and codes become ids (any letter case, spaces trimmed), Valid from is today when empty, a blank manager is none and a blank mobile is left out.
   */
  it('turns names and codes into the user input', () => {
    const out = mapUsersRows([raw(2, { 'Department code': ' it ', 'Role names': 'auditor;Initiator', Mobile: '', 'Reporting manager code': '', 'Valid to': '2027-03-31' })], ref, TODAY);
    expect(out).toMatchObject({ total: 1, problems: [] });
    expect(out.rows[0]).toMatchObject({ excelRow: 2 });
    expect(out.rows[0].input).toEqual({
      employeeCode: '20002', fullName: 'Anil Kumar', email: 'anil2@example.invalid', departmentId: 'd1', designationId: 'g1', reportingManagerCode: null, signIn: 'LOCAL',
      companies: [{ companyCode: 'IPL', roleIds: ['r2', 'r1'], validFrom: TODAY, validTo: '2027-03-31' }],
    });
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-03
   * @subtask ST-ADM01-009-IN-04
   * In plain words: supporting test. A row with an unknown code, an unknown role, a wrong sign-in type or a wrong date is left out and each problem is listed with the Excel row, the column and the value.
   */
  it('leaves out a row with a problem and lists each problem', () => {
    const out = mapUsersRows([
      raw(2),
      raw(3, { 'Department code': 'XX' }),
      raw(4, { 'Role names': 'Initiator, Boss' }),
      raw(5, { 'Sign-in type': 'MAGIC', 'Valid from': '01/12/2026' }),
      raw(6, { 'Company code': 'NOPE', 'Designation code': 'ZZ' }),
    ], ref, TODAY);
    expect(out.rows.map((r) => r.excelRow)).toEqual([2]);
    expect(out.total).toBe(5);
    expect(out.problems).toEqual([
      { excelRow: 3, column: 'Department code', value: 'XX', message: 'No department with code XX' },
      { excelRow: 4, column: 'Role names', value: 'Initiator, Boss', message: 'No role named Boss' },
      { excelRow: 5, column: 'Sign-in type', value: 'MAGIC', message: 'Sign-in type must be SSO or LOCAL' },
      { excelRow: 5, column: 'Valid from', value: '01/12/2026', message: 'Enter the date as YYYY-MM-DD' },
      { excelRow: 6, column: 'Designation code', value: 'ZZ', message: 'No designation with code ZZ' },
      { excelRow: 6, column: 'Company code', value: 'NOPE', message: 'No company with code NOPE' },
    ]);
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-03
   * @subtask ST-ADM01-009-IN-04
   * In plain words: supporting test. A code or e-mail used twice in the file: the first row wins and the later row gets the problem, even when the first row was left out for another reason.
   */
  it('reports a code or e-mail used twice: the first row wins', () => {
    const out = mapUsersRows([
      raw(2, { 'Employee code': '30001', 'E-mail': 'a@example.invalid' }),
      raw(3, { 'Employee code': '30001', 'E-mail': 'b@example.invalid' }),
      raw(4, { 'Employee code': '30004', 'E-mail': 'A@Example.invalid' }),
      raw(5, { 'Employee code': '30005', 'Department code': 'XX', 'E-mail': 'c@example.invalid' }),
      raw(6, { 'Employee code': '30006', 'E-mail': 'c@example.invalid' }),
    ], ref, TODAY);
    expect(out.rows.map((r) => r.excelRow)).toEqual([2]);
    expect(out.problems.filter((p) => p.message.includes('twice')).map((p) => `${p.excelRow}:${p.column}`)).toEqual(['3:Employee code', '4:E-mail', '6:E-mail']);
    expect(out.problems.find((p) => p.excelRow === 3)?.message).toBe('The employee code is used twice in the file (rows 2 and 3)');
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-03
   * @subtask ST-ADM01-009-IN-04
   * In plain words: supporting test. A server problem (position in the list sent, field name) becomes a table line with the Excel row, the column name and the value from the file.
   */
  it('turns server problems into table lines', () => {
    const rows = mapUsersRows([raw(2), raw(3), raw(4, { 'Role names': 'Initiator' }), raw(5)], ref, TODAY).rows;
    const lines = problemsFromServer(
      [{ row: 1, field: 'email', message: 'The e-mail is already used' }, { row: 2, field: 'companies.0.roleIds', message: 'Choose at least one role' }, { row: 2, field: 'departmentId', message: 'Choose an existing department' }, { row: 2, field: 'row', message: 'The row could not be saved' }],
      rows,
      2,
    );
    expect(lines).toEqual([
      { excelRow: 4, column: 'E-mail', value: 'anil4@example.invalid', message: 'The e-mail is already used' },
      { excelRow: 5, column: 'Role names', value: 'Initiator, Auditor', message: 'Choose at least one role' },
      { excelRow: 5, column: 'Department code', value: 'IT', message: 'Choose an existing department' },
      { excelRow: 5, column: 'Row', value: '', message: 'The row could not be saved' },
    ]);
  });
});
