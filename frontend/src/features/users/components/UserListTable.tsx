/**
 * @file    UserListTable.tsx
 * @module  Users
 *
 * @description
 * User table. In plain words: the table of the design with avatars, chips, badges and actions.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-001
 * @subtask        ST-ADM01-001-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-01 #list
 * @status         built
 */

import Link from 'next/link';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import type { UserListItem } from '../types/user.types';
import type { UserActionResult } from './UserActionNotice';
import { UserRowMenu } from './UserRowMenu';

interface UserListTableProps {
  users: UserListItem[];
  /** Current order as `field:asc|desc`. */
  sort?: string;
  onSort?: (field: string) => void;
  onResult: (result: UserActionResult) => void;
  onDeactivated: () => void;
}

const initials = (name: string): string => name.replace(/[^A-Z]/g, '').slice(0, 2) || name.slice(0, 2).toUpperCase();
const STATUS_BADGE = { ACTIVE: ['b-success', 'Active'], INACTIVE: ['b-neutral', 'Inactive'], LOCKED: ['b-danger', 'Locked'] } as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Today 09:31", "Yesterday", "30-Jun-2026" or "Never", as the design writes the last sign-in. */
export function lastSignInLabel(iso: string | null, now: Date = new Date()): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86_400_000);
  if (diff === 0) return `Today ${d.toTimeString().slice(0, 5)}`;
  if (diff === 1) return 'Yesterday';
  return `${String(d.getDate()).padStart(2, '0')}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}

/**
 * UserListTable.
 *
 * In plain words: the user table of the high-fidelity design: tinted header, avatar and two-line cells, company chips, sign-in pill, status badge with the last sign-in, edit icon and the more-actions menu.
 */
export function UserListTable({ users, sort = 'name:asc', onSort, onResult, onDeactivated }: UserListTableProps) {
  const [by, dir] = sort.split(':');
  const head = (label: string, field?: string) => {
    const here = field === by;
    return (
      <th
        scope="col"
        className={field ? hf('sortable') : undefined}
        aria-sort={field ? (here ? (dir === 'desc' ? 'descending' : 'ascending') : 'none') : undefined}
        tabIndex={field ? 0 : undefined}
        onClick={field ? () => onSort?.(field) : undefined}
        onKeyDown={field ? (e) => (e.key === 'Enter' || e.key === ' ') && onSort?.(field) : undefined}
      >
        {label}
        {field && (
          <span className={hf('sort')}>
            <HfIcon name={here ? (dir === 'desc' ? 'sortD' : 'sortU') : 'sort'} size="sm" />
          </span>
        )}
      </th>
    );
  };
  return (
    <div className={hf('table-wrap')}>
      <table className={hf('tbl')} data-testid="users-table">
        <thead>
          <tr>
            {head('Employee code', 'employeeCode')}
            {head('Name', 'name')}
            {head('Department · designation', 'department')}
            {head('Companies and roles')}
            {head('Sign-in', 'signIn')}
            {head('Status', 'status')}
            <th scope="col" className={hf('act')}>
              <span className={hf('sr-only')}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const [cls, word] = STATUS_BADGE[u.status];
            return (
              <tr key={u.employeeCode}>
                <td>
                  <Link className={hf('mono')} href={`/users/${u.employeeCode}`}>
                    {u.employeeCode}
                  </Link>
                </td>
                <td>
                  <div className={hf('person')}>
                    <span className={hf('avatar sm')} aria-hidden="true">
                      {initials(u.name)}
                    </span>
                    <span>
                      <b>{u.name}</b>
                      <small>{u.email}</small>
                    </span>
                  </div>
                </td>
                <td>
                  {u.department ?? '-'}
                  <small>{u.designation ?? '-'}</small>
                </td>
                <td>
                  {u.companies.length === 0 ? (
                    <span className={hf('badge b-warning')}>No role yet</span>
                  ) : (
                    <div className={hf('chips')}>
                      {u.companies.map((c) => (
                        <span key={c.code} className={hf('chip')}>
                          <b style={{ fontWeight: 600 }}>{c.code}</b>
                          {'· '}
                          {c.roles.join(', ')}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  <span className={hf('badge plain', u.signIn === 'SSO' ? 'b-primary' : 'b-neutral')}>{u.signIn === 'SSO' ? 'SSO' : 'Local'}</span>
                </td>
                <td>
                  <span className={hf('badge', cls)}>{word}</span>
                  <small>Last sign-in: {lastSignInLabel(u.lastSignIn)}</small>
                </td>
                <td className={hf('act')}>
                  <div className={hf('row-actions')}>
                    <Link className={hf('btn btn-text icon sm')} href={`/users/${u.employeeCode}/edit`} aria-label={`Edit ${u.name}`} title="Edit">
                      <HfIcon name="edit" size="sm" />
                    </Link>
                    <UserRowMenu user={u} place="list" onResult={onResult} onDeactivated={onDeactivated} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
