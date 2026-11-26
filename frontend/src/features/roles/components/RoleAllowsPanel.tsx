/**
 * @file    RoleAllowsPanel.tsx
 * @module  RolesFeature
 *
 * @description
 * What the role allows. In plain words: the allowed permissions with their scope, the type, status and last changed.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleAllowsPanel.tsx
 * @lld-synced     v0.30
 * @status         built
 */
import { StatusBadge } from '@/components/ams';
import { formatDay } from '@/lib/utils';
import type { RoleDetails } from '../types/role.types';

/** Props of RoleAllowsPanel. */
interface RoleAllowsPanelProps {
  /** The role with its allows */
  role: RoleDetails;
  /** Label of each permission key; a key without a label is shown as it is */
  labels?: Record<string, string>;
}

const SCOPE = { OWN: 'own only', DEPARTMENT: 'own department', COMPANY: 'whole company' } as const;

/**
 * What the role allows. In plain words: the allowed permissions with their scope in words, then type, status, companies and last changed.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-05
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @returns The rendered panel
 */
export function RoleAllowsPanel({ role, labels = {} }: RoleAllowsPanelProps) {
  return (
    <aside className="card p-3" aria-label="What this role allows" data-testid="roles-allows">
      <h2 className="h5">What this role allows</h2>
      <ul className="list-unstyled">
        {role.allows.map((a) => (
          <li key={a.permission}>
            {labels[a.permission] ?? a.permission}
            {a.scope ? <strong> — {SCOPE[a.scope]}</strong> : null}
          </li>
        ))}
      </ul>
      <dl className="row mb-0 small">
        <dt className="col-5">Type</dt>
        <dd className="col-7">{role.type === 'STANDARD' ? 'Standard' : 'Custom'}</dd>
        <dt className="col-5">Status</dt>
        <dd className="col-7">
          <StatusBadge status={role.status} />
        </dd>
        <dt className="col-5">Companies</dt>
        <dd className="col-7">Same role in every company</dd>
        <dt className="col-5">Last changed</dt>
        <dd className="col-7">{formatDay(role.lastChanged)}</dd>
      </dl>
    </aside>
  );
}
