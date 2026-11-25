/**
 * @file    PlainWordsPanel.tsx
 * @module  RolesFeature
 *
 * @description
 * The plain-words panel. In plain words: lists what the switched-on permissions allow and how many are not allowed (decision L-66).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/PlainWordsPanel.tsx
 * @lld-synced     v0.24
 * @status         built
 */
import type { PermissionCell } from '../types/role.types';

/** Props of PlainWordsPanel. */
interface PlainWordsPanelProps {
  /** The current cells */
  cells: PermissionCell[];
  /** Label of each permission key (all permissions of the catalog) */
  labels: Record<string, string>;
}

const SCOPE = { OWN: 'own only', DEPARTMENT: 'own department', COMPANY: 'whole company' } as const;

/**
 * Plain-words panel. In plain words: lists what the switched-on permissions allow, with the data scope in words, and how many are not allowed. Computed on the screen, no API call.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-02
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.5
 * @status    built
 *
 * @returns The rendered panel
 */
export function PlainWordsPanel({ cells, labels }: PlainWordsPanelProps) {
  const on = cells.filter((c) => c.allowed && labels[c.permissionKey]);
  const off = Object.keys(labels).length - on.length;
  return (
    <aside className="card p-3" aria-label="In plain words" data-testid="roles-plain-words">
      <h2 className="h5">In plain words</h2>
      <ul className="list-unstyled mb-2">
        {on.map((c) => (
          <li key={c.permissionKey}>
            {labels[c.permissionKey]}
            {c.scope ? <strong> — {SCOPE[c.scope]}</strong> : null}
          </li>
        ))}
      </ul>
      <p className="small text-body-secondary mb-0">Not allowed: {off} permissions</p>
    </aside>
  );
}
