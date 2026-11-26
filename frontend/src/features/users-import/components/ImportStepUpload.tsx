'use client';

/**
 * @file    ImportStepUpload.tsx
 * @module  UsersImport
 *
 * @description
 * Step 2. In plain words: drag or browse for one .xlsx file; shows its name, Remove, and the reason a file was refused.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/components/ImportStepUpload.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { Button } from '@/components/ui';

/** Props of ImportStepUpload. */
interface ImportStepUploadProps {
  fileName: string | null;
  error: string | null;
  busy: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}

/**
 * Step 2.
 *
 * In plain words: choose or drop one .xlsx file; shows its name, Remove, and the reason a file was refused.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-05
 * @ac       AC-US009-02
 */
export function ImportStepUpload({ fileName, error, busy, onFile, onRemove }: ImportStepUploadProps) {
  return (
    <section aria-labelledby="import-step-2">
      <h2 id="import-step-2" className="h5">Upload file</h2>
      <label htmlFor="users-import-file" className="form-label">Filled template (.xlsx)</label>
      <input
        id="users-import-file"
        type="file"
        accept=".xlsx"
        className="form-control"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
      <p className="small text-body-secondary mt-1">.xlsx only · up to 5,000 rows · one sheet. Choose the file or drop it on the box. Nothing is sent until it has been read here.</p>
      {fileName && (
        <p>
          {fileName}{' '}
          <Button variant="link" size="sm" onClick={onRemove} disabled={busy}>Remove</Button>
        </p>
      )}
      {busy && <p role="status">Checking the file…</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
