/**
 * @file    import.types.ts
 * @module  UsersImport
 *
 * @description
 * Types and limits of the users import wizard. In plain words: the column names of the template, a raw row, a mapped row, a problem, the reference lists and the answers of the two calls.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/types/import.types.ts
 * @lld-synced     v0.30
 * @status         built
 */

import type { CompanyItem, MasterItem, UserFormData } from '@/features/users/types/user.types';

export const MAX_ROWS = 5000;
export const GROUP_SIZE = 200;

/** The template columns, in order. */
export const COLUMNS = ['Employee code', 'Full name', 'E-mail', 'Mobile', 'Department code', 'Designation code', 'Reporting manager code', 'Sign-in type', 'Company code', 'Role names', 'Valid from', 'Valid to'] as const;
export type Column = (typeof COLUMNS)[number];

/** One data row of the file: its Excel row number and its cells as text. */
export interface RawRow {
  excelRow: number;
  cells: Record<Column, string>;
}

/** One row that could be turned into a user input; the cells are kept to show the value of a problem. */
export interface ImportRow {
  excelRow: number;
  cells: Record<Column, string>;
  input: UserFormData;
}

/** One problem, as the check table and the CSV show it. */
export interface Problem {
  excelRow: number;
  column: string;
  value: string;
  message: string;
}

/** The lists the codes and names are looked up in. */
export interface Reference {
  departments: MasterItem[];
  designations: MasterItem[];
  companies: CompanyItem[];
  roles: { roleId: string; name: string }[];
}

/** The result of mapping the rows of a file. */
export interface MappedFile {
  total: number;
  rows: ImportRow[];
  problems: Problem[];
}

/** A problem as the server reports it (position in the list sent, field name). */
export interface ServerProblem {
  row: number;
  field: string;
  message: string;
}
export interface CheckAnswer {
  checked: number;
  failed: ServerProblem[];
}
export interface ImportAnswer {
  created: number;
  failed: ServerProblem[];
}
