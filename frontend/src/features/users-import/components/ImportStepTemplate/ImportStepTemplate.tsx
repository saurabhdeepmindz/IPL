'use client';

/**
 * @file    ImportStepTemplate.tsx
 * @module  UsersImport
 *
 * @description
 * Import step 1. In plain words: what to import and the template.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @hf             HF-ADM-05
 * @story         US-ADM01-009
 * @subtask       ST-ADM01-009-IN-05
 * @lld           LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file      docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/components/ImportStepTemplate.tsx
 * @lld-synced    v0.30
 * @status         built
 */

import { useRouter } from 'next/navigation';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';

/** What the design lets you choose to import; only Users is built here, the others open the Coming soon page. */
const KINDS = [
  { key: 'users', title: 'Users', text: 'Employee code, name, e-mail, department, designation, company and roles' },
  { key: 'dept', title: 'Departments and sub-departments', text: 'Code, name, parent, head' },
  { key: 'des', title: 'Designations', text: 'Code, name, level, group' },
  { key: 'sc', title: 'Subject codes', text: 'Code, subject, proposal types, DoA scope' },
  { key: 'doa', title: 'DoA matrix (draft version)', text: 'Scope, amount from, up to, final approver, FC needed' },
  { key: 'hol', title: 'Holidays', text: 'Date, holiday, applies to, type' },
];

interface ImportStepTemplateProps {
  busy: boolean;
  error: string | null;
  onDownload: () => void;
}

/**
 * Step 1.
 *
 * In plain words: "What do you want to import?" with the six choices of the design (Users is built; the others open the Coming soon page), the template card and the Download template button.
 */
export function ImportStepTemplate({ busy, error, onDownload }: ImportStepTemplateProps) {
  const router = useRouter();
  return (
    <section aria-labelledby="import-step-1">
      <h3 id="import-step-1" className={hf('sh')}>
        What do you want to import?
      </h3>
      <div className={hf('pick')} role="radiogroup" aria-label="What to import">
        {KINDS.map((k) => (
          <label key={k.key}>
            <input
              type="radio"
              name="kind"
              value={k.key}
              checked={k.key === 'users'}
              onChange={() => {
                if (k.key !== 'users') router.push(`/coming-soon?feature=${encodeURIComponent(`Import of ${k.title}`)}`);
              }}
            />
            <span>
              <b>{k.title}</b>
              <small>{k.text}</small>
            </span>
          </label>
        ))}
        <div className={hf('muted')} style={{ gridColumn: '1/-1', fontSize: 'var(--fs-1)' }}>
          Vendors, plants and purchase groups are not imported here — they come from SAP (SAP Masters).
        </div>
      </div>
      <div className={hf('card')} style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center', flexWrap: 'wrap', border: '1px solid var(--stroke-100)', boxShadow: 'none' }}>
        <span className={hf('kpi-ico')}>
          <HfIcon name="xls" />
        </span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <b>AMS_Users_Template_v1.xlsx</b>
          <p className={hf('muted')} style={{ margin: '2px 0 0', fontSize: 'var(--fs-2)' }}>
            Columns with rules, an example row, and drop-down lists filled from the current masters.
          </p>
        </div>
        <button type="button" className={hf('btn btn-outline')} onClick={onDownload} disabled={busy}>
          <HfIcon name="download" />
          Download template
        </button>
      </div>
      {error && (
        <p role="alert" style={{ marginTop: 'var(--spacing-md)' }}>
          {error}
        </p>
      )}
    </section>
  );
}
