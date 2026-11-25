/**
 * @file    RoleUsersTable.tsx
 * @module  RolesFeature
 *
 * @description
 * The users of a role. In plain words: a table of user, department, company and assigned-on date; the empty message "No users have this role yet".
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.22 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.22.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleUsersTable.tsx
 * @lld-synced     v0.22
 * @status         built
 */
import { formatDay } from '@/lib/utils';
import type { RoleHolder } from '../types/role.types';

/** Props of RoleUsersTable. */
interface RoleUsersTableProps {
  /** The holders of the role */
  users: RoleHolder[];
}

/**
 * Users of a role. In plain words: a table of user, department, company and assigned-on date; the empty message "No users have this role yet". No Remove action in this release (decision L-65).
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
 * @returns The rendered table
 */
export function RoleUsersTable({ users }: RoleUsersTableProps) {
  if (users.length === 0) return <p data-testid="roles-users-empty">No users have this role yet</p>;
  return (
    <table className="table align-middle" data-testid="roles-users-table">
      <thead>
        <tr>
          <th scope="col">User</th>
          <th scope="col">Department</th>
          <th scope="col">Company</th>
          <th scope="col">Assigned on</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={`${u.employeeCode}-${u.company}`}>
            <td>
              {u.name}
              <div className="small text-body-secondary">{u.employeeCode}</div>
            </td>
            <td>{u.department ?? '-'}</td>
            <td>{u.company}</td>
            <td>{formatDay(u.assignedOn)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
