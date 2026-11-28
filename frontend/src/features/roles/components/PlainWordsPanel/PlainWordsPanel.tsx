/**
 * @file    PlainWordsPanel.tsx
 * @module  Roles
 *
 * @description
 * In plain words card. In plain words: the sentence list beside the role form.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @hf             HF-ADM-02 #new, #edit
 * @story         US-ADM01-012
 * @subtask       ST-ADM01-012-FE-02
 * @lld           LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file      docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/PlainWordsPanel.tsx
 * @lld-synced    v0.30
 * @status         built
 */

import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import type { PermissionCell } from '../../types/role.types';

interface PlainWordsPanelProps {
  cells: PermissionCell[];
  labels: Record<string, string>;
}

const SCOPE = { OWN: 'own only', DEPARTMENT: 'own department', COMPANY: 'whole company' } as const;

/**
 * PlainWordsPanel.
 *
 * In plain words: the "In plain words" card of the design: a tick and the sentence for every permission that is on (with its scope in bold) and the count of those that are not allowed.
 */
export function PlainWordsPanel({ cells, labels }: PlainWordsPanelProps) {
  const on = cells.filter((c) => c.allowed && labels[c.permissionKey]);
  const off = Object.keys(labels).length - on.length;
  return (
    <aside className={hf('card')} aria-label="In plain words" data-testid="roles-plain-words" style={{ position: 'sticky', top: 96 }}>
      <div className={hf('card-head')}>
        <h3>In plain words</h3>
      </div>
      <div className={hf('card-body')}>
        <ul className={hf('sumlist')}>
          {on.map((c) => (
            <li key={c.permissionKey}>
              <HfIcon name="check" size="sm" />
              <span>
                {labels[c.permissionKey]}
                {c.scope ? (
                  <>
                    {' — '}
                    <b>{SCOPE[c.scope]}</b>
                  </>
                ) : null}
              </span>
            </li>
          ))}
          <li style={{ paddingTop: 'var(--spacing-md)' }}>
            <span className={hf('muted')} style={{ fontSize: 'var(--fs-1)' }}>
              Not allowed: {off} permissions
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
