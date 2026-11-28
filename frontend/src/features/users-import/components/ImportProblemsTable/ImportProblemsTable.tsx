'use client';

/**
 * @file    ImportProblemsTable.tsx
 * @module  UsersImport
 *
 * @description
 * Problems table. In plain words: the rows with problems.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-05
 * @status         built
 */

import { hf } from '@/hf/hf';
import type { Problem } from '../../types/import.types';

const SHOWN = 200;

interface ImportProblemsTableProps {
  problems: Problem[];
}

/**
 * The problems table.
 *
 * In plain words: Row, Column, Value in file, Problem in the design's table; row numbers match the Excel sheet. The first 200 lines are shown; the error report has all of them.
 */
export function ImportProblemsTable({ problems }: ImportProblemsTableProps) {
  return (
    <>
      <div className={hf('table-wrap')}>
        <table className={hf('tbl')} data-testid="import-problems">
          <caption className={hf('sr-only')}>Rows with problems</caption>
          <thead>
            <tr>
              <th scope="col" className={hf('num')}>
                Row
              </th>
              <th scope="col">Column</th>
              <th scope="col">Value in file</th>
              <th scope="col">Problem</th>
            </tr>
          </thead>
          <tbody>
            {problems.slice(0, SHOWN).map((p, i) => (
              <tr key={`${p.excelRow}-${p.column}-${i}`}>
                <td className={hf('num mono')}>{p.excelRow}</td>
                <td>{p.column}</td>
                <td>{p.value ? <span className={hf('code')}>{p.value}</span> : <span className={hf('muted')}>empty</span>}</td>
                <td>{p.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {problems.length > SHOWN && <p style={{ fontSize: 'var(--fs-1)', padding: '0 var(--spacing-xl)' }}>{`and ${problems.length - SHOWN} more; download the error report for all of them.`}</p>}
    </>
  );
}
