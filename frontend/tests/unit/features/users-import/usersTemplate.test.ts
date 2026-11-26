/**
 * @file    usersTemplate.test.ts
 * @module  Tests
 *
 * @description
 * Vitest tests of the template and the error report. Written before the code.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users-import/usersTemplate.test.ts
 * @lld-synced     v0.30
 * @status         built
 */

import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { buildUsersTemplate } from '@/features/users-import/services/buildUsersTemplate';
import { errorReportCsv } from '@/features/users-import/services/errorReportCsv';
import { readUsersFile } from '@/features/users-import/services/readUsersFile';
import { COLUMNS, type Reference } from '@/features/users-import/types/import.types';

const ref: Reference = {
  departments: [{ id: 'd1', code: 'IT', name: 'Information Technology' }, { id: 'd2', code: 'FIN', name: 'Finance' }],
  designations: [{ id: 'g1', code: 'SM', name: 'Senior Manager' }],
  companies: [{ code: 'IPL', name: 'Indian Potash Limited' }, { code: 'IPLFB', name: 'IPL Subsidiary' }],
  roles: [{ roleId: 'r1', name: 'Initiator' }, { roleId: 'r2', name: 'Auditor' }],
};

/** Reads the bytes of a Blob (jsdom has no Blob.arrayBuffer). */
const bytes = (blob: Blob): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });

describe('US-ADM01-009 the template and the error report (supporting tests)', () => {
  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-02
   * @subtask ST-ADM01-009-IN-04
   * In plain words: supporting test. The template has the twelve columns in order, an example row, a hidden sheet with the lists and drop-downs made from them; the example row is not read as data (an unfilled template has no rows).
   */
  it('builds the twelve columns, an example row and the drop-downs', async () => {
    const blob = await buildUsersTemplate(ref);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await bytes(blob));
    const users = wb.getWorksheet('Users')!;
    expect((users.getRow(1).values as string[]).slice(1)).toEqual([...COLUMNS]);
    expect(String(users.getRow(2).getCell(1).value)).toMatch(/^e\.g\./);
    const lists = wb.getWorksheet('Lists')!;
    expect(lists.state).toBe('hidden');
    const listed = (col: number) => (lists.getColumn(col).values as unknown[]).slice(1).filter(Boolean);
    expect(listed(1)).toEqual(expect.arrayContaining(['IT', 'FIN']));
    expect(listed(4)).toEqual(expect.arrayContaining(['Initiator', 'Auditor']));
    const signIn = users.getCell(3, COLUMNS.indexOf('Sign-in type') + 1).dataValidation;
    expect(signIn.type).toBe('list');
    expect(JSON.stringify(signIn.formulae)).toContain('SSO,LOCAL');
    expect(users.getCell(3, COLUMNS.indexOf('Department code') + 1).dataValidation.type).toBe('list');
    await expect(readUsersFile(new File([await bytes(blob)], 'AMS_Users_Template_v1.xlsx'))).rejects.toThrow(/no rows/i);
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-03
   * @subtask ST-ADM01-009-IN-04
   * In plain words: supporting test. The CSV has the header, doubles quotes, quotes a comma and protects a value that starts with = + - or @ so Excel does not run it.
   */
  it('makes the CSV text', () => {
    const csv = errorReportCsv([{ excelRow: 3, column: 'E-mail', value: 'a"b@example.invalid', message: 'Enter a valid e-mail address, up to 254 characters' }]);
    expect(csv).toBe('Row,Column,Value,Problem\r\n3,E-mail,"a""b@example.invalid","Enter a valid e-mail address, up to 254 characters"\r\n');
    expect(errorReportCsv([])).toBe('Row,Column,Value,Problem\r\n');
  });

  it('protects a value that starts with = + - or @', () => {
    for (const bad of ['=SUM(A1)', '+1', '-2', '@x']) {
      expect(errorReportCsv([{ excelRow: 2, column: 'Full name', value: bad, message: 'x' }])).toContain(`,"'${bad}",`);
    }
  });
});
