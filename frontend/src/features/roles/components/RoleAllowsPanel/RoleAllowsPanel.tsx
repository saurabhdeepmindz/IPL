/**
 * @file    RoleAllowsPanel.tsx
 * @module  Roles
 *
 * @description
 * What a role allows. In plain words: the card of the design with the tick list and the facts.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-02 #view
 * @status         built
 */

import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { formatDay } from '@/lib/utils';
import type { RoleDetails } from '../../types/role.types';

interface RoleAllowsPanelProps {
  role: RoleDetails;
  labels?: Record<string, string>;
}

const SCOPE = { OWN: 'own only', DEPARTMENT: 'own department', COMPANY: 'whole company' } as const;
const BADGE = { ACTIVE: ['b-success', 'Active'], DRAFT: ['b-warning', 'Draft'], INACTIVE: ['b-neutral', 'Inactive'] } as const;

/**
 * RoleAllowsPanel.
 *
 * In plain words: the "What this role allows" card of the design: a tick and a sentence for each permission, then type, status, companies and last change.
 */
export function RoleAllowsPanel({ role, labels = {} }: RoleAllowsPanelProps) {
  const [cls, word] = BADGE[role.status];
  const total = Object.keys(labels).length;
  const off = Math.max(0, total - role.allows.length);
  return (
    <aside className={hf('card')} aria-label="What this role allows" data-testid="roles-allows">
      <div className={hf('card-head')}>
        <h3>What this role allows</h3>
        <a className={hf('btn btn-text sm')} href="/permissions">
          Full matrix
        </a>
      </div>
      <div className={hf('card-body')}>
        <ul className={hf('sumlist')}>
          {role.allows.map((a) => (
            <li key={a.permission}>
              <HfIcon name="check" size="sm" />
              <span>
                {labels[a.permission] ?? a.permission}
                {a.scope ? (
                  <>
                    {' — '}
                    <b>{SCOPE[a.scope]}</b>
                  </>
                ) : null}
              </span>
            </li>
          ))}
          {total > 0 && (
            <li style={{ paddingTop: 'var(--spacing-md)' }}>
              <span className={hf('muted')} style={{ fontSize: 'var(--fs-1)' }}>
                Not allowed: {off} permissions
              </span>
            </li>
          )}
        </ul>
        <hr className={hf('divider')} style={{ margin: 'var(--spacing-lg) 0' }} />
        <dl className={hf('dl')} style={{ gridTemplateColumns: '110px 1fr' }}>
          <dt>Type</dt>
          <dd>{role.type === 'STANDARD' ? 'Standard' : 'Custom'}</dd>
          <dt>Status</dt>
          <dd>
            <span className={hf('badge', cls)}>{word}</span>
          </dd>
          <dt>Companies</dt>
          <dd>Same role in every company</dd>
          <dt>Last changed</dt>
          <dd>
            {formatDay(role.lastChanged)}
            {role.changedBy ? ` · ${role.changedBy}` : ''}
          </dd>
        </dl>
      </div>
    </aside>
  );
}
