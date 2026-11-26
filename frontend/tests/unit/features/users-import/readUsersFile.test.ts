/**
 * @file    readUsersFile.test.ts
 * @module  Tests
 *
 * @description
 * Vitest tests of reading the file. Written before the code. The files are made in the test with `exceljs`.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users-import/readUsersFile.test.ts
 * @lld-synced     v0.30
 * @status         built
 */

import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { ImportFileError, readUsersFile } from '@/features/users-import/services/readUsersFile';
import { COLUMNS } from '@/features/users-import/types/import.types';

type Cell = string | number | Date | null;

/** Makes an .xlsx File: a header row and the data rows, optionally with more sheets. */
async function makeFile(rows: Cell[][], opts: { header?: string[]; name?: string; extraSheet?: 'visible' | 'hidden' } = {}): Promise<File> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Users');
  ws.addRow(opts.header ?? [...COLUMNS]);
  rows.forEach((r) => ws.addRow(r));
  if (opts.extraSheet) wb.addWorksheet('Lists').state = opts.extraSheet === 'hidden' ? 'hidden' : 'visible';
  const buffer = await wb.xlsx.writeBuffer();
  return new File([buffer as ArrayBuffer], opts.name ?? 'users.xlsx');
}

const row = (code: Cell, name: Cell = 'Anil Kumar'): Cell[] => [code, name, 'anil@example.invalid', '9876543210', 'IT', 'SM', '10001', 'LOCAL', 'IPL', 'Initiator, Auditor', null, null];

describe('US-ADM01-009 reading the file (supporting tests)', () => {
  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-02
   * @subtask ST-ADM01-009-IN-04
   * In plain words: supporting test. A good file gives its rows with their Excel row numbers; a number becomes text, a date becomes YYYY-MM-DD, an empty row is skipped and the example row of the template is skipped.
   */
  it('reads the rows with Excel row numbers', async () => {
    const file = await makeFile([['e.g. 12345', 'Example'], row(20001), [null, null], row('20002', 'Meera Rao'), [...row(20003).slice(0, 10), new Date('2026-12-01T00:00:00Z'), null]]);
    const rows = await readUsersFile(file);
    expect(rows.map((r) => r.excelRow)).toEqual([3, 5, 6]);
    expect(rows[0].cells['Employee code']).toBe('20001');
    expect(rows[0].cells['Role names']).toBe('Initiator, Auditor');
    expect(rows[1].cells['Full name']).toBe('Meera Rao');
    expect(rows[2].cells['Valid from']).toBe('2026-12-01');
    expect(rows[0].cells['Valid from']).toBe('');
  });

  it('accepts the columns in any order and in any letter case, and a hidden second sheet', async () => {
    const header = [...COLUMNS].reverse().map((c) => c.toUpperCase());
    const file = await makeFile([[...row(20001)].reverse()], { header, extraSheet: 'hidden' });
    const rows = await readUsersFile(file);
    expect(rows).toHaveLength(1);
    expect(rows[0].cells['Employee code']).toBe('20001');
    expect(rows[0].cells['Company code']).toBe('IPL');
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-02
   * @subtask ST-ADM01-009-IN-04
   * In plain words: supporting test. A file that is not .xlsx, has two visible sheets, lacks a column, is empty or has 5,001 rows is refused with a message the person can act on.
   */
  it('refuses a file that is not .xlsx', async () => {
    await expect(readUsersFile(await makeFile([row(20001)], { name: 'users.csv' }))).rejects.toThrow(/\.xlsx/);
  });

  it('refuses two visible sheets', async () => {
    const error = await readUsersFile(await makeFile([row(20001)], { extraSheet: 'visible' })).then(() => null, (e: unknown) => e);
    expect(error).toBeInstanceOf(ImportFileError);
    expect((error as Error).message).toMatch(/one sheet/i);
  });

  it('names a missing column', async () => {
    const header = COLUMNS.filter((c) => c !== 'E-mail');
    await expect(readUsersFile(await makeFile([], { header: [...header] }))).rejects.toThrow(/E-mail/);
  });

  it('refuses a file with no data rows', async () => {
    await expect(readUsersFile(await makeFile([]))).rejects.toThrow(/no rows/i);
  });

  it('refuses more than 5,000 rows', async () => {
    const many = Array.from({ length: 5001 }, (_, i) => row(20000 + i));
    await expect(readUsersFile(await makeFile(many))).rejects.toThrow(/5,000/);
  }, 30_000);
});
