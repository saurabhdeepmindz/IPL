'use client';

/**
 * @file    ImportStepTemplate.tsx
 * @module  UsersImport
 *
 * @description
 * Step 1. In plain words: explains the columns and downloads AMS_Users_Template_v1.xlsx.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/components/ImportStepTemplate.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { Button } from '@/components/ui';
import { COLUMNS } from '../types/import.types';

/** Props of ImportStepTemplate. */
interface ImportStepTemplateProps {
  busy: boolean;
  error: string | null;
  onDownload: () => void;
  onNext: () => void;
}

/**
 * Step 1.
 *
 * In plain words: explains the columns and downloads AMS_Users_Template_v1.xlsx.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-05
 * @ac       AC-US009-02
 */
export function ImportStepTemplate({ busy, error, onDownload, onNext }: ImportStepTemplateProps) {
  return (
    <section aria-labelledby="import-step-1">
      <h2 id="import-step-1" className="h5">Choose and download template</h2>
      <p>Download the template, fill one row per user and save it as .xlsx. The drop-down lists in the template come from the current departments, designations, companies and roles.</p>
      <p className="small text-body-secondary">{`Columns: ${COLUMNS.join(', ')}. One company per row; a manager must already exist as an Active user.`}</p>
      <div className="d-flex gap-2">
        <Button variant="secondary" outline onClick={onDownload} isLoading={busy}>Download template</Button>
        <Button onClick={onNext}>Next: upload file</Button>
      </div>
      {error && <p role="alert" className="mt-2">{error}</p>}
    </section>
  );
}
