/**
 * @file    errorReportCsv.ts
 * @module  UsersImport
 *
 * @description
 * The error report. In plain words: the problems as CSV text (Row, Column, Value, Problem); a value that starts with = + - or @ is prefixed so Excel does not run it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/services/errorReportCsv.ts
 * @lld-synced     v0.30
 * @status         built
 */

import type { Problem } from '../types/import.types';

/** A value that starts with = + - @ or a control character is prefixed so a spreadsheet does not run it as a formula. */
const protect = (value: string): string => (/^[=+\-@\t\r]/.test(value) ? `'${value}` : value);
const quote = (value: string): string => `"${value.replace(/"/g, '""')}"`;

/**
 * Makes the CSV text.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-04
 * @ac       AC-US009-03
 * @param problems - the lines of the check table
 * @returns CSV text with a header line, quotes doubled, lines ending in CRLF
 */
export function errorReportCsv(problems: Problem[]): string {
  const lines = problems.map((p) => `${p.excelRow},${p.column},${quote(protect(p.value))},${quote(p.message)}`);
  return ['Row,Column,Value,Problem', ...lines].map((l) => `${l}\r\n`).join('');
}
