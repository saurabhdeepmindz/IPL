/**
 * @file    readUsersFile.ts
 * @module  UsersImport
 *
 * @description
 * Reads the .xlsx file in the browser. In plain words: one visible sheet, a header row with every template column, up to 5,000 data rows; nothing is sent to the server.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/services/readUsersFile.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { COLUMNS, MAX_ROWS, type Column, type RawRow } from '../types/import.types';

/** A message the user can act on (wrong file, missing column, too many rows). */
export class ImportFileError extends Error {}

/** The bytes of a file (FileReader works in every browser and in the test environment). */
const readBytes = (file: Blob): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new ImportFileError('The file could not be read. Save it as .xlsx and try again.'));
    reader.readAsArrayBuffer(file);
  });

/** One cell as plain text: dates become YYYY-MM-DD, links and rich text give their words, formulas their result. */
function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    const v = value as { text?: unknown; richText?: { text: string }[]; result?: unknown };
    if (v.richText) return v.richText.map((t) => t.text).join('').trim();
    if (v.text !== undefined) return cellText(v.text);
    if (v.result !== undefined) return cellText(v.result);
    return '';
  }
  return String(value).trim();
}

/**
 * Reads the file.
 *
 * In plain words: loads `exceljs` only now, checks the sheet and the header, turns every cell into text (dates become YYYY-MM-DD) and skips empty rows and the example row of the template.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-04
 * @ac       AC-US009-02
 * @param file - the chosen file
 * @returns The data rows with their Excel row numbers
 * @throws ImportFileError - not .xlsx, more than one visible sheet, a column missing (named), no rows, more than 5,000 rows
 */
export async function readUsersFile(file: File): Promise<RawRow[]> {
  if (!/\.xlsx$/i.test(file.name)) throw new ImportFileError('Choose an Excel file saved as .xlsx.');
  const mod = await import('exceljs');
  const ExcelJS = (mod as unknown as { default?: typeof mod }).default ?? mod;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await readBytes(file)).catch(() => {
    throw new ImportFileError('The file could not be read. Save it as .xlsx and try again.');
  });
  const visible = workbook.worksheets.filter((s) => s.state === 'visible');
  if (visible.length !== 1) throw new ImportFileError(`The file must have one sheet; this one has ${visible.length}. Keep only the Users sheet.`);
  const sheet = visible[0];
  const position = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, col) => position.set(cellText(cell.value).toLowerCase(), col));
  const missing = COLUMNS.filter((c) => !position.has(c.toLowerCase()));
  if (missing.length > 0) throw new ImportFileError(`The file has no column: ${missing.join(', ')}. Use the template.`);
  const rows: RawRow[] = [];
  for (let n = 2; n <= sheet.rowCount; n += 1) {
    const row = sheet.getRow(n);
    const cells = Object.fromEntries(COLUMNS.map((c) => [c, cellText(row.getCell(position.get(c.toLowerCase()) as number).value)])) as Record<Column, string>;
    if (COLUMNS.every((c) => cells[c] === '') || cells['Employee code'].toLowerCase().startsWith('e.g.')) continue;
    rows.push({ excelRow: n, cells });
    if (rows.length > MAX_ROWS) throw new ImportFileError(`The file has more than ${MAX_ROWS.toLocaleString('en-US')} rows; the limit is ${MAX_ROWS.toLocaleString('en-US')}.`);
  }
  if (rows.length === 0) throw new ImportFileError('The file has no rows to import.');
  return rows;
}
