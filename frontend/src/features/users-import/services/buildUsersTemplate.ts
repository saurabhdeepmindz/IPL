/**
 * @file    buildUsersTemplate.ts
 * @module  UsersImport
 *
 * @description
 * Builds the template. In plain words: an .xlsx with the header row, one example row, text columns and drop-down lists made from the current departments, designations, companies and roles (kept on a hidden second sheet).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/services/buildUsersTemplate.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { COLUMNS, MAX_ROWS, type Column, type Reference } from '../types/import.types';

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** The rule of each column, shown as a note on its header cell. */
const NOTES: Record<Column, string> = {
  'Employee code': 'Required. 5 digits. Not used by another user.',
  'Full name': 'Required. Up to 100 characters.',
  'E-mail': 'Required. A valid address, not used by another user.',
  Mobile: 'Optional. 7 to 20 digits, spaces, + or -.',
  'Department code': 'Required. Choose from the list.',
  'Designation code': 'Required. Choose from the list.',
  'Reporting manager code': 'The employee code of an Active user. Empty only for the highest designation. The manager must exist before the import.',
  'Sign-in type': 'Required. SSO or LOCAL.',
  'Company code': 'Required. Choose from the list. One company per row.',
  'Role names': 'Required. One or more role names from the Roles list, separated by commas.',
  'Valid from': 'Optional. YYYY-MM-DD. Empty means today.',
  'Valid to': 'Optional. YYYY-MM-DD.',
};

/** Which list a drop-down column reads from: the column letter on the hidden sheet. */
const LIST_COLUMN: Partial<Record<Column, string>> = { 'Department code': 'A', 'Designation code': 'B', 'Company code': 'C' };

/**
 * Builds the template file.
 *
 * In plain words: a Users sheet (header, one example row, text columns, drop-downs) and a hidden Lists sheet with the current codes and role names.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-04
 * @ac       AC-US009-02
 * @param ref - the lists for the drop-downs
 * @returns The file as a Blob (the caller names it AMS_Users_Template_v1.xlsx)
 */
export async function buildUsersTemplate(ref: Reference): Promise<Blob> {
  const mod = await import('exceljs');
  const ExcelJS = (mod as unknown as { default?: typeof mod }).default ?? mod;
  const workbook = new ExcelJS.Workbook();
  const users = workbook.addWorksheet('Users');
  const lists = workbook.addWorksheet('Lists');
  lists.state = 'hidden';
  const values = [ref.departments.map((d) => d.code), ref.designations.map((d) => d.code), ref.companies.map((c) => c.code), ref.roles.map((r) => r.name)];
  ['Departments', 'Designations', 'Companies', 'Roles'].forEach((title, i) => {
    lists.getCell(1, i + 1).value = title;
    values[i].forEach((v, n) => (lists.getCell(n + 2, i + 1).value = v));
  });
  users.addRow([...COLUMNS]).font = { bold: true };
  users.addRow(['e.g. 12345', 'Anil Kumar', 'anil.kumar@example.com', '9876543210', values[0][0] ?? '', values[1][0] ?? '', '10001', 'LOCAL', values[2][0] ?? '', values[3][0] ?? '', '', '']);
  COLUMNS.forEach((name, i) => {
    const column = users.getColumn(i + 1);
    column.width = 24;
    column.numFmt = '@';
    users.getCell(1, i + 1).note = NOTES[name];
    const letter = LIST_COLUMN[name];
    const formula = name === 'Sign-in type' ? '"SSO,LOCAL"' : letter ? `Lists!$${letter}$2:$${letter}$${Math.max(values['ABC'.indexOf(letter)].length, 1) + 1}` : null;
    if (formula) for (let r = 3; r <= MAX_ROWS + 2; r += 1) users.getCell(r, i + 1).dataValidation = { type: 'list', allowBlank: true, formulae: [formula] };
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: XLSX });
}
