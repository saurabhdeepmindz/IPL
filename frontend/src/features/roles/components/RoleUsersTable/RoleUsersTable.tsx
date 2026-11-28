/**
 * @file    RoleUsersTable.tsx
 * @module  Roles
 *
 * @description
 * Users of a role. In plain words: the table of the design.
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

import Link from 'next/link';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { formatDay } from '@/lib/utils';
import type { RoleHolder } from '../../types/role.types';

interface RoleUsersTableProps {
  users: RoleHolder[];
  /** Current order as `field:asc|desc`. */
  sort?: string;
  onSort?: (field: string) => void;
}

const initials = (name: string): string => name.replace(/[^A-Z]/g, '').slice(0, 2) || name.slice(0, 2).toUpperCase();

/**
 * RoleUsersTable.
 *
 * In plain words: the "Users with this role" table of the design: avatar, name and code, department, company and the day the role was given.
 */
export function RoleUsersTable({ users, sort = '', onSort }: RoleUsersTableProps) {
  const [by, dir] = sort.split(':');
  if (users.length === 0) {
    return (
      <div className={hf('empty')} data-testid="roles-users-empty">
        <span className={hf('art')}>
          <HfIcon name="users" size="lg" />
        </span>
        <b>No users have this role yet</b>
        <p>Assign users so they can use what this role allows.</p>
      </div>
    );
  }
  return (
    <div className={hf('table-wrap')}>
      <table className={hf('tbl')} data-testid="roles-users-table">
        <thead>
          <tr>
            {(
              [
                ['User', 'name'],
                ['Department', 'department'],
                ['Company', 'company'],
                ['Assigned on', 'since'],
              ] as const
            ).map(([h, field]) => (
              <th
                key={h}
                scope="col"
                className={hf('sortable')}
                aria-sort={field === by ? (dir === 'desc' ? 'descending' : 'ascending') : 'none'}
                tabIndex={0}
                onClick={() => onSort?.(field)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSort?.(field)}
              >
                {h}
                <span className={hf('sort')}>
                  <HfIcon name={field === by ? (dir === 'desc' ? 'sortD' : 'sortU') : 'sort'} size="sm" />
                </span>
              </th>
            ))}
            <th scope="col" className={hf('act')} style={{ width: 105 }}>
              <span className={hf('sr-only')}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={`${u.employeeCode}-${u.company}`}>
              <td>
                <div className={hf('person')}>
                  <span className={hf('avatar sm')} aria-hidden="true">
                    {initials(u.name)}
                  </span>
                  <span>
                    <b>
                      <Link href={`/users/${u.employeeCode}`}>{u.name}</Link>
                    </b>
                    <small className={hf('mono')} style={{ fontSize: 'var(--fs-1)' }}>
                      {u.employeeCode}
                    </small>
                  </span>
                </div>
              </td>
              <td>{u.department ?? '-'}</td>
              <td>{u.companyName ? `${u.companyName} · ${u.company}` : u.company}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{formatDay(u.assignedOn)}</td>
              <td className={hf('act')} style={{ width: 105 }} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
