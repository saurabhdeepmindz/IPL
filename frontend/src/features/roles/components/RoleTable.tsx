/**
 * @file    RoleTable.tsx
 * @module  RolesFeature
 *
 * @description
 * The role table. In plain words: one row per role with name and description, what it allows, type, users, last changed and status; the actions edit, users and deactivate.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleTable.tsx
 * @lld-synced     v0.29
 * @status         built
 */
import Link from 'next/link';
import { StatusBadge } from '@/components/ams';
import { formatDay } from '@/lib/utils';
import type { Role } from '../types/role.types';

/** Props of RoleTable. */
interface RoleTableProps {
  /** The roles to show */
  roles: Role[];
  /** Called when Deactivate is chosen */
  onDeactivate: (role: Role) => void;
}

/** The Administrator role is locked by the server; the screen only shows it. */
const isLocked = (r: Role): boolean => r.type === 'STANDARD' && r.name === 'Administrator';

/**
 * Role table. In plain words: one row per role with name and description, type, users, last changed and status; the Administrator role shows a lock and no edit or deactivate.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-01
 * @ac        AC-US012-01, AC-US012-04, AC-US012-05
 * @lld       LLD-EPIC-ADM-01 v0.29 §6.5
 * @status    built
 *
 * @dependencies StatusBadge
 *
 * @returns The rendered table
 */
export function RoleTable({ roles, onDeactivate }: RoleTableProps) {
  return (
    <table className="table align-middle" data-testid="roles-table">
      <thead>
        <tr>
          <th scope="col">Role</th>
          <th scope="col">Type</th>
          <th scope="col">Users</th>
          <th scope="col">Last changed</th>
          <th scope="col">Status</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {roles.map((r) => (
          <tr key={r.roleId}>
            <td>
              <Link href={`/roles/${r.roleId}`} className="fw-semibold">
                {r.name}
              </Link>
              <div className="small text-body-secondary">{r.description}</div>
            </td>
            <td>{r.type === 'STANDARD' ? 'Standard' : 'Custom'}</td>
            <td>
              <Link href={`/roles/${r.roleId}`}>{r.userCount}</Link>
            </td>
            <td>{formatDay(r.lastChanged)}</td>
            <td>
              <StatusBadge status={r.status} />
            </td>
            <td>
              {isLocked(r) ? (
                <span data-testid={`role-locked-${r.roleId}`}>Locked (system role)</span>
              ) : (
                <>
                  <Link href={`/roles/${r.roleId}/edit`} aria-label={`Edit ${r.name}`} className="me-3">
                    Edit
                  </Link>
                  {r.status !== 'INACTIVE' && (
                    <button type="button" className="btn btn-link p-0 text-danger" aria-label={`Deactivate ${r.name}`} onClick={() => onDeactivate(r)}>
                      Deactivate
                    </button>
                  )}
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
