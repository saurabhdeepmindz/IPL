'use client';

/**
 * @file    ImportStepImport.tsx
 * @module  UsersImport
 *
 * @description
 * Import step 4. In plain words: progress and result.
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

import Link from 'next/link';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import type { Problem } from '../types/import.types';
import { ImportProblemsTable } from './ImportProblemsTable';

interface ImportStepImportProps {
  done: number;
  total: number;
  result: { created: number; failed: number } | null;
  problems: Problem[];
  onDownload: () => void;
  onAgain: () => void;
}

/**
 * Step 4.
 *
 * In plain words: the progress bar with "n of N rows", then the finished state of the design ("Import finished", counts, Open Users, Start another import) with the problems table when some rows failed.
 */
export function ImportStepImport({ done, total, result, problems, onDownload, onAgain }: ImportStepImportProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <section aria-labelledby="import-step-4">
      <h2 id="import-step-4" className={hf('sr-only')}>
        Import
      </h2>
      {!result && (
        <div>
          <h3 className={hf('sh')}>Importing…</h3>
          <div className={hf('bar')} style={{ height: 12 }}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <p className={hf('muted')} role="status" style={{ fontSize: 'var(--fs-2)' }}>{`Importing… ${done} of ${total} rows`}</p>
        </div>
      )}
      {result && (
        <>
          <div className={hf('empty')} style={{ padding: 'var(--spacing-3xl) var(--spacing-xl)' }}>
            <span className={hf('art')} style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
              <HfIcon name="checkC" />
            </span>
            <b>Import finished</b>
            <p role="status" data-testid="import-result">{`Import finished: ${result.created} created, ${result.failed} failed.`}</p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/users" className={hf('btn btn-primary')}>
                Open Users
              </Link>
              <button type="button" className={hf('btn btn-outline')} onClick={onAgain}>
                Start another import
              </button>
            </div>
          </div>
          {problems.length > 0 && (
            <div className={hf('card')} style={{ boxShadow: 'none', border: '1px solid var(--stroke-100)' }}>
              <div className={hf('card-head')}>
                <div>
                  <h2 style={{ fontSize: 'var(--fs-4)' }}>Rows that could not be imported</h2>
                </div>
                <button type="button" className={hf('btn btn-outline sm')} onClick={onDownload}>
                  <HfIcon name="download" />
                  Download error report
                </button>
              </div>
              <ImportProblemsTable problems={problems} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
