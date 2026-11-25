'use client';

/**
 * @file    ImportProblemsTable.tsx
 * @module  UsersImport
 *
 * @description
 * The problems table. In plain words: Row, Column, Value in file, Problem; row numbers match the Excel sheet.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/components/ImportProblemsTable.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import type { Problem } from '../types/import.types';

const SHOWN = 200;

/** Props of ImportProblemsTable. */
interface ImportProblemsTableProps {
  problems: Problem[];
}

/**
 * The problems table.
 *
 * In plain words: Row, Column, Value in file, Problem; row numbers match the Excel sheet. The first 200 lines are shown; the error report has all of them.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-05
 * @ac       AC-US009-03
 */
export function ImportProblemsTable({ problems }: ImportProblemsTableProps) {
  return (
    <>
      <table className="table table-sm align-middle" data-testid="import-problems">
        <caption>Rows with problems</caption>
        <thead>
          <tr>
            <th scope="col">Row</th>
            <th scope="col">Column</th>
            <th scope="col">Value in file</th>
            <th scope="col">Problem</th>
          </tr>
        </thead>
        <tbody>
          {problems.slice(0, SHOWN).map((p, i) => (
            <tr key={`${p.excelRow}-${p.column}-${i}`}>
              <td>{p.excelRow}</td>
              <td>{p.column}</td>
              <td>{p.value}</td>
              <td>{p.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {problems.length > SHOWN && <p className="small">{`and ${problems.length - SHOWN} more; download the error report for all of them.`}</p>}
    </>
  );
}
