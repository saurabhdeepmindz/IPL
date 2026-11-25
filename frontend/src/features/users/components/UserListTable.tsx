/**
 * @file    UserListTable.tsx
 * @module  UsersFeature
 *
 * @description
 * The user table. In plain words: one row per user with code, name with initials, department and designation, one chip per company with its roles, sign-in method, status with last sign-in and an edit action.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserListTable.tsx
 * @lld-synced     v0.29
 * @status         built
 */
import Link from 'next/link';
import { StatusBadge } from '@/components/ams';
import { formatDay } from '@/lib/utils';
import type { UserListItem } from '../types/user.types';
import type { UserActionResult } from './UserActionNotice';
import { UserRowMenu } from './UserRowMenu';

/** Props of UserListTable. */
interface UserListTableProps {
  /** The users to show */
  users: UserListItem[];
  /** Called with the result of a row action, for the notice */
  onResult: (result: UserActionResult) => void;
  /** Called after a user was deactivated from the menu */
  onDeactivated: () => void;
}

const initials = (name: string): string => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

/**
 * User table. In plain words: one row per user with code, name with initials, department and designation, one chip per company with its roles, sign-in method, status as a word with the last sign-in, and the actions: Edit and the row menu (decisions L-79, L-87). The code links to the details page.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-01
 * @ac        AC-US002-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies StatusBadge, UserRowMenu
 *
 * @returns The rendered table
 */
export function UserListTable({ users, onResult, onDeactivated }: UserListTableProps) {
  return (
    <table className="table align-middle" data-testid="users-table">
      <thead>
        <tr>
          <th scope="col">Employee code</th>
          <th scope="col">Name</th>
          <th scope="col">Department · designation</th>
          <th scope="col">Companies and roles</th>
          <th scope="col">Sign-in</th>
          <th scope="col">Status</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.employeeCode}>
            <td>
              <Link href={`/users/${u.employeeCode}`}>{u.employeeCode}</Link>
            </td>
            <td>
              <span className="badge text-bg-light me-2" aria-hidden="true">{initials(u.name)}</span>
              {u.name}
              <div className="small text-body-secondary">{u.email}</div>
            </td>
            <td>
              {u.department ?? '-'} · {u.designation ?? '-'}
            </td>
            <td>
              {u.companies.map((c) => (
                <span key={c.code} className="badge text-bg-light border me-1">{`${c.code}: ${c.roles.join(', ')}`}</span>
              ))}
            </td>
            <td>{u.signIn === 'SSO' ? 'SSO' : 'Local'}</td>
            <td>
              <StatusBadge status={u.status} />
              <div className="small text-body-secondary">Last sign-in {u.lastSignIn ? formatDay(u.lastSignIn) : 'Never'}</div>
            </td>
            <td>
              <Link href={`/users/${u.employeeCode}/edit`} aria-label={`Edit ${u.name}`} className="me-2">
                Edit
              </Link>
              <UserRowMenu user={u} place="list" onResult={onResult} onDeactivated={onDeactivated} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
