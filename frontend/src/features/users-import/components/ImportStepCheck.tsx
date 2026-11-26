'use client';

/**
 * @file    ImportStepCheck.tsx
 * @module  UsersImport
 *
 * @description
 * Step 3. In plain words: how many rows passed and how many have problems; the problems table; Download error report; Import the rows that passed (off when none passed).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/components/ImportStepCheck.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { Button } from '@/components/ui';
import type { Problem } from '../types/import.types';
import { ImportProblemsTable } from './ImportProblemsTable';

/** Props of ImportStepCheck. */
interface ImportStepCheckProps {
  total: number;
  passed: number;
  problems: Problem[];
  onImport: () => void;
  onBack: () => void;
  onDownload: () => void;
}

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

/**
 * Step 3.
 *
 * In plain words: how many rows passed and how many have problems; the problems table; Download error report; Import the rows that passed (off when none passed).
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-05
 * @ac       AC-US009-03
 */
export function ImportStepCheck({ total, passed, problems, onImport, onBack, onDownload }: ImportStepCheckProps) {
  const withProblems = new Set(problems.map((p) => p.excelRow)).size;
  return (
    <section aria-labelledby="import-step-3">
      <h2 id="import-step-3" className="h5">Check</h2>
      <p>The file has been checked. Nothing has been changed yet. Fix the rows with problems in Excel and upload again, or import only the rows that passed.</p>
      <p data-testid="check-summary">{`${plural(total, 'row', 'rows')} read. ${passed} can be imported. ${withProblems} ${withProblems === 1 ? 'has' : 'have'} problems.`}</p>
      {problems.length > 0 ? <ImportProblemsTable problems={problems} /> : <p>No problems found.</p>}
      <div className="d-flex gap-2">
        <Button variant="secondary" outline onClick={onBack}>Back</Button>
        {problems.length > 0 && <Button variant="secondary" outline onClick={onDownload}>Download error report</Button>}
        <Button onClick={onImport} disabled={passed === 0}>Import the rows that passed</Button>
      </div>
    </section>
  );
}
