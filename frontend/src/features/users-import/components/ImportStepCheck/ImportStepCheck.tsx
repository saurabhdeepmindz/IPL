'use client';

/**
 * @file    ImportStepCheck.tsx
 * @module  UsersImport
 *
 * @description
 * Import step 3. In plain words: the check result.
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
import { HfIcon } from '@/hf/HfIcon';
import type { Problem } from '../../types/import.types';
import { ImportProblemsTable } from '../ImportProblemsTable';

interface ImportStepCheckProps {
  total: number;
  passed: number;
  problems: Problem[];
  onDownload: () => void;
}

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

/**
 * Step 3.
 *
 * In plain words: the "checked, nothing changed yet" note, three count cards (rows in file, ready to import, rows with problems) and the card "Rows with problems" with Download error report.
 */
export function ImportStepCheck({ total, passed, problems, onDownload }: ImportStepCheckProps) {
  const withProblems = new Set(problems.map((p) => p.excelRow)).size;
  const cards = [
    { label: 'Rows in file', val: total, icon: 'file' as const, tone: '', sub: '' },
    { label: 'Ready to import', val: passed, icon: 'checkC' as const, tone: 'ok', sub: '' },
    { label: 'Rows with problems', val: withProblems, icon: 'alertC' as const, tone: 'err', sub: 'Not imported unless fixed' },
  ];
  return (
    <section aria-labelledby="import-step-3">
      <h2 id="import-step-3" className={hf('sr-only')}>
        Check
      </h2>
      <div className={hf('alert info')} style={{ marginBottom: 'var(--spacing-xl)' }}>
        <span>
          <HfIcon name="info" />
        </span>
        <div>
          <b>The file has been checked. Nothing has been changed yet.</b>
          Fix the rows with problems in Excel and upload again, or import only the rows that passed.
        </div>
      </div>
      <p className={hf('sr-only')} data-testid="check-summary">{`${plural(total, 'row', 'rows')} read. ${passed} can be imported. ${withProblems} ${withProblems === 1 ? 'has' : 'have'} problems.`}</p>
      <div className={hf('grid g-4')} style={{ marginBottom: 'var(--spacing-xl)' }}>
        {cards.map((k) => (
          <div key={k.label} className={hf('kpi')}>
            <div className={hf('top')}>
              <span className={hf('lbl')}>{k.label}</span>
              <span className={hf('ico', k.tone)}>
                <HfIcon name={k.icon} />
              </span>
            </div>
            <span className={hf('val')}>{k.val}</span>
            {k.sub && <span className={hf('sub')}>{k.sub}</span>}
          </div>
        ))}
      </div>
      {problems.length > 0 ? (
        <div className={hf('card')} style={{ boxShadow: 'none', border: '1px solid var(--stroke-100)' }}>
          <div className={hf('card-head')}>
            <div>
              <h2 style={{ fontSize: 'var(--fs-4)' }}>Rows with problems</h2>
              <p>Row numbers match the Excel sheet</p>
            </div>
            <button type="button" className={hf('btn btn-outline sm')} onClick={onDownload}>
              <HfIcon name="download" />
              Download error report
            </button>
          </div>
          <ImportProblemsTable problems={problems} />
        </div>
      ) : (
        <p>No problems found.</p>
      )}
    </section>
  );
}
