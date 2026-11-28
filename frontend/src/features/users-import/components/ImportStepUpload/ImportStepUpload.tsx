'use client';

/**
 * @file    ImportStepUpload.tsx
 * @module  UsersImport
 *
 * @description
 * Import step 2. In plain words: the drop box and the file chip.
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

import { useState } from 'react';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { COLUMNS } from '../../types/import.types';

interface ImportStepUploadProps {
  file: File | null;
  error: string | null;
  busy: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}

/**
 * Step 2.
 *
 * In plain words: "Upload the filled file": the drop box of the design (drag the file, or browse), the file chip with Remove, and the reason a file was refused. Nothing is sent until "Check file".
 */
export function ImportStepUpload({ file, error, busy, onFile, onRemove }: ImportStepUploadProps) {
  const [over, setOver] = useState(false);
  const kb = file ? Math.max(1, Math.round(file.size / 1024)) : 0;
  return (
    <section aria-labelledby="import-step-2">
      <h3 id="import-step-2" className={hf('sh')}>
        Upload the filled file
      </h3>
      <input
        id="users-import-file"
        type="file"
        accept=".xlsx"
        aria-label="Filled template (.xlsx)"
        className={hf('sr-only')}
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
      />
      {!file && (
        <div
          className={hf('dz', over && 'over')}
          tabIndex={0}
          role="button"
          aria-label="Choose a file to upload"
          onClick={() => document.getElementById('users-import-file')?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && document.getElementById('users-import-file')?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
        >
          <span>
            <HfIcon name="upload" />
          </span>
          <b>
            Drag the file here or <a href="#browse" onClick={(e) => e.preventDefault()}>browse</a>
          </b>
          <span>.xlsx only · up to 5,000 rows · one sheet</span>
        </div>
      )}
      <p className={hf('muted')} style={{ margin: 'var(--spacing-md) 0 0', fontSize: 'var(--fs-1)' }}>{`Columns: ${COLUMNS.join(', ')}. One company per row; a manager must already exist as an Active user.`}</p>
      {error && (
        <div className={hf('field')} style={{ marginTop: 'var(--spacing-sm)' }}>
          <span className={hf('err')} role="alert" style={{ display: 'flex' }}>
            <span>
              <HfIcon name="alertC" />
            </span>
            <span>{error}</span>
          </span>
        </div>
      )}
      {file && (
        <div className={hf('alert info')} style={{ marginTop: 'var(--spacing-lg)' }}>
          <span>
            <HfIcon name="file" />
          </span>
          <div>
            <b>{file.name}</b>
            <span>{`${kb} KB`}</span>
          </div>
          <button type="button" className={hf('btn btn-text sm')} style={{ marginLeft: 'auto' }} onClick={onRemove} disabled={busy}>
            Remove
          </button>
        </div>
      )}
      {busy && <p role="status">Checking the file…</p>}
    </section>
  );
}
