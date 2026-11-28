'use client';

/**
 * @file    SensitiveWarning.tsx
 * @module  Permissions
 *
 * @description
 * Sensitive warning. In plain words: the warning alert of the review dialog.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-03 #revModal
 * @status         built
 */

import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';

interface SensitiveWarningProps {
  warnings: string[];
  confirmed: boolean;
  missing: boolean;
  onChange: (confirmed: boolean) => void;
}

/**
 * SensitiveWarning.
 *
 * In plain words: the warning alert of the review dialog (design HF-ADM-03): what is sensitive about the change, and a tick "I understand and confirm" that must be set to save.
 */
export function SensitiveWarning({ warnings, confirmed, missing, onChange }: SensitiveWarningProps) {
  if (warnings.length === 0) return null;
  return (
    <div role="alert" className={hf('alert warning')} data-testid="sensitive-warning" style={{ marginBottom: 'var(--spacing-lg)' }}>
      <span>
        <HfIcon name="alert" />
      </span>
      <div>
        <ul style={{ margin: '0 0 var(--spacing-sm)', paddingLeft: 'var(--spacing-lg)' }}>
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        <label className={hf('check')}>
          <input id="confirm-sensitive" type="checkbox" checked={confirmed} aria-invalid={missing || undefined} onChange={(e) => onChange(e.target.checked)} /> I understand and confirm
        </label>
        {missing && !confirmed && <div style={{ color: 'var(--text-error)', fontSize: 'var(--fs-1)' }}>Confirm to continue</div>}
      </div>
    </div>
  );
}
