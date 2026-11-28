'use client';

/**
 * @file    RoleTable.tsx
 * @module  Roles
 *
 * @description
 * Role table. In plain words: the table of the design with role icon, summary, badges and actions.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @hf             HF-ADM-02 #list
 * @story         US-ADM01-012
 * @subtask       ST-ADM01-012-FE-02
 * @lld           LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file      docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleTable.tsx
 * @lld-synced    v0.30
 * @status         built
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { formatDay } from '@/lib/utils';
import type { Role } from '../../types/role.types';

interface RoleTableProps {
  roles: Role[];
  onDeactivate: (role: Role) => void;
  /** Current order as `field:asc|desc` (client side: the list is short). */
  sort?: string;
  onSort?: (field: string) => void;
}

const isLocked = (r: Role): boolean => r.type === 'STANDARD' && r.name === 'Administrator';
const STATUS_BADGE = { ACTIVE: ['b-success', 'Active'], DRAFT: ['b-warning', 'Draft'], INACTIVE: ['b-neutral', 'Inactive'] } as const;
const cut = (text: string, n = 60): string => (text.length > n ? `${text.slice(0, n)}…` : text);

/** The "more actions" menu of a role row (view, edit, assign, deactivate); the Administrator role shows a locked line. */
function RoleRowMenu({ role, onDeactivate }: { role: Role; onDeactivate: (role: Role) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  return (
    <div ref={wrap} className={hf('menu-wrap')} style={{ display: 'inline-block' }}>
      <button type="button" className={hf('btn btn-text icon sm')} aria-haspopup="menu" aria-expanded={open} aria-label={`More actions for ${role.name}`} onClick={() => setOpen(!open)}>
        <HfIcon name="more" size="sm" />
      </button>
      {open && (
        <div role="menu" className={hf('menu', 'open')}>
          <Link role="menuitem" href={`/roles/${role.roleId}`}>
            <HfIcon name="eye" size="sm" />
            View details
          </Link>
          {!isLocked(role) && (
            <Link role="menuitem" href={`/roles/${role.roleId}/edit`}>
              <HfIcon name="edit" size="sm" />
              Edit role
            </Link>
          )}
          <Link role="menuitem" href={`/roles/${role.roleId}`}>
            <HfIcon name="users" size="sm" />
            Assign users
          </Link>
          <hr />
          {isLocked(role) ? (
            <button type="button" role="menuitem" disabled style={{ opacity: 0.5 }}>
              <HfIcon name="lock" size="sm" />
              System role · locked
            </button>
          ) : (
            role.status !== 'INACTIVE' && (
              <button
                type="button"
                role="menuitem"
                className={hf('danger')}
                aria-label={`Deactivate ${role.name}`}
                onClick={() => {
                  setOpen(false);
                  onDeactivate(role);
                }}
              >
                <HfIcon name="ban" size="sm" />
                Deactivate role
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/**
 * RoleTable.
 *
 * In plain words: the role table of the high-fidelity design (HF-ADM-02): role icon and name with its description cut at 60 characters, what it allows, type, users, last changed, status, and the edit, assign and more-actions icons.
 */
export function RoleTable({ roles, onDeactivate, sort = '', onSort }: RoleTableProps) {
  const [by, dir] = sort.split(':');
  const head = (label: string, field?: string, num = false) => {
    const here = field === by;
    return (
      <th
        scope="col"
        className={[field && hf('sortable'), num && hf('num')].filter(Boolean).join(' ') || undefined}
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
      <table className={hf('tbl')} data-testid="roles-table">
        <thead>
          <tr>
            {head('Role', 'name')}
            {head('What it allows')}
            {head('Type', 'type')}
            {head('Users', 'users', true)}
            {head('Last changed', 'changed')}
            {head('Status', 'status')}
            <th scope="col" className={hf('act')}>
              <span className={hf('sr-only')}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => {
            const [cls, word] = STATUS_BADGE[r.status];
            const locked = isLocked(r);
            return (
              <tr key={r.roleId}>
                <td>
                  <div className={hf('role-name')}>
                    <span className={hf('role-ico', locked && 'sys')}>
                      <HfIcon name={locked ? 'lock' : 'shield'} size="sm" />
                    </span>
                    <span>
                      <Link href={`/roles/${r.roleId}`} style={{ fontWeight: 600 }}>
                        {r.name}
                      </Link>
                      <small>{cut(r.description)}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <small style={{ color: 'var(--neutral-800)', maxWidth: 420 }}>{r.allowsSummary?.join(' · ') ?? ''}</small>
                </td>
                <td>
                  <span className={hf('badge plain', r.type === 'STANDARD' ? 'b-neutral' : 'b-primary')}>{r.type === 'STANDARD' ? 'Standard' : 'Custom'}</span>
                </td>
                <td className={hf('num')}>
                  <Link href={`/roles/${r.roleId}`}>{r.userCount}</Link>
                </td>
                <td>{formatDay(r.lastChanged)}</td>
                <td>
                  <span className={hf('badge', cls)}>{word}</span>
                </td>
                <td className={hf('act')}>
                  <div className={hf('row-actions')}>
                    {locked ? (
                      <span data-testid={`role-locked-${r.roleId}`} className={hf('sr-only')}>
                        Locked (system role)
                      </span>
                    ) : (
                      <Link className={hf('btn btn-text icon sm')} href={`/roles/${r.roleId}/edit`} aria-label={`Edit ${r.name}`} title="Edit">
                        <HfIcon name="edit" size="sm" />
                      </Link>
                    )}
                    <Link className={hf('btn btn-text icon sm')} href={`/roles/${r.roleId}`} aria-label={`Assign users to ${r.name}`} title="Assign users">
                      <HfIcon name="users" size="sm" />
                    </Link>
                    <RoleRowMenu role={r} onDeactivate={onDeactivate} />
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
