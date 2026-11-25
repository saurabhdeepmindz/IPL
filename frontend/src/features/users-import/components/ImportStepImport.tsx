'use client';

/**
 * @file    ImportStepImport.tsx
 * @module  UsersImport
 *
 * @description
 * Step 4. In plain words: "Importing... n of N rows", then "Import finished" with created and failed counts, Open Users and Start another import.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/components/ImportStepImport.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import Link from 'next/link';
import { Button } from '@/components/ui';
import type { Problem } from '../types/import.types';
import { ImportProblemsTable } from './ImportProblemsTable';

/** Props of ImportStepImport. */
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
 * In plain words: "Importing… n of N rows", then "Import finished" with the created and failed counts, Open Users and Start another import.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-05
 * @ac       AC-US009-02
 */
export function ImportStepImport({ done, total, result, problems, onDownload, onAgain }: ImportStepImportProps) {
  return (
    <section aria-labelledby="import-step-4">
      <h2 id="import-step-4" className="h5">Import</h2>
      {!result && <p role="status">{`Importing… ${done} of ${total} rows`}</p>}
      {result && (
        <>
          <p role="status" data-testid="import-result">{`Import finished: ${result.created} created, ${result.failed} failed.`}</p>
          {problems.length > 0 && (
            <>
              <ImportProblemsTable problems={problems} />
              <Button variant="secondary" outline onClick={onDownload}>Download error report</Button>
            </>
          )}
          <div className="d-flex gap-2 mt-3">
            <Link href="/users" className="btn btn-primary">Open Users</Link>
            <Button variant="secondary" outline onClick={onAgain}>Start another import</Button>
          </div>
        </>
      )}
    </section>
  );
}
