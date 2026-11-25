/**
 * @file    SensitiveWarning.tsx
 * @module  Permissions
 *
 * @description
 * Warning of the review. In plain words: the warning sentences of the server in a banner with the tick "I understand and confirm" (decision L-106).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-016
 * @subtask        ST-ADM01-016-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/components/SensitiveWarning.tsx
 * @lld-synced     v0.28
 * @status         built
 */
'use client';

/** Props of SensitiveWarning. */
interface SensitiveWarningProps {
  /** The warning sentences of the server; none shows nothing */
  warnings: string[];
  /** True when the tick is set */
  confirmed: boolean;
  /** True to mark the tick as missing */
  missing: boolean;
  /** Called with the new tick state */
  onChange: (confirmed: boolean) => void;
}

/**
 * Sensitive warning. In plain words: a banner with the sentences and one tick that must be set before Save changes works.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-016
 * @subtask   ST-ADM01-016-FE-02
 * @frd       FR-043.3
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-02, API-PRM-03
 * @ac        AC-US016-02
 * @lld       LLD-EPIC-ADM-01 v0.28 §6.7
 * @status    built
 *
 * @returns The rendered output
 */
export function SensitiveWarning({ warnings, confirmed, missing, onChange }: SensitiveWarningProps) {
  if (warnings.length === 0) return null;
  return (
    <div role="alert" className="alert alert-warning mt-3" data-testid="sensitive-warning">
      <ul className="mb-2">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <div className="form-check">
        <input id="confirm-sensitive" type="checkbox" className="form-check-input" checked={confirmed} aria-invalid={missing || undefined} onChange={(e) => onChange(e.target.checked)} />
        <label htmlFor="confirm-sensitive" className="form-check-label">
          I understand and confirm
        </label>
      </div>
      {missing && !confirmed && <div className="text-danger small mt-1">Confirm to continue</div>}
    </div>
  );
}
