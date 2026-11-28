'use client';

/**
 * @file    PermissionMatrix.tsx
 * @module  Permissions
 *
 * @description
 * Permission matrix. In plain words: HF-ADM-03 grid.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-03
 * @status         built
 */

import { Fragment } from 'react';
import Link from 'next/link';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import type { MatrixChanges } from '../../hooks/useMatrixChanges';
import type { MatrixPermission, MatrixRole, PermissionMatrixData } from '../../types/permission.types';
import { PermissionSwitch } from '../PermissionSwitch';
import { ScopeSelect } from '../ScopeSelect';

const scoped = (p: MatrixPermission): boolean => Object.values(p.cells).some((c) => c.scope !== null);

interface PermissionMatrixProps {
  matrix: PermissionMatrixData;
  changes: MatrixChanges;
  search: string;
  module: string;
  changedOnly: boolean;
}

/** The small line under a role in the header: "142 users", "System · locked" or "Draft · 0 users". */
function roleNote(r: MatrixRole, locked: boolean): string {
  const users = r.userCount === 1 ? '1 user' : `${r.userCount} users`;
  if (locked) return 'System · locked';
  return r.status && r.status !== 'ACTIVE' ? `${r.status.charAt(0)}${r.status.slice(1).toLowerCase()} · ${users}` : users;
}

/**
 * PermissionMatrix.
 *
 * In plain words: the matrix of the high-fidelity design (HF-ADM-03): a column per role (the system role tinted), the modules as grouped rows, a toggle or a data-scope list in every cell.
 */
export function PermissionMatrix({ matrix, changes, search, module, changedOnly }: PermissionMatrixProps) {
  const needle = search.trim().toLowerCase();
  const rows = matrix.groups
    .filter((g) => !module || g.module === module)
    .map((g) => ({
      module: g.module,
      note: g.note,
      permissions: g.permissions.filter((p) => {
        if (needle && !`${p.label} ${p.hint} ${p.key}`.toLowerCase().includes(needle)) return false;
        if (changedOnly && !matrix.roles.some((r) => changes.isChanged(r.roleId, p.key))) return false;
        return true;
      }),
    }))
    .filter((g) => g.permissions.length > 0);
  const lockedRole = (roleId: string) => matrix.groups.every((g) => g.permissions.every((p) => p.cells[roleId]?.locked));

  if (rows.length === 0) {
    return (
      <div className={hf('empty')} data-testid="matrix-empty">
        <span className={hf('art')}>
          <HfIcon name="search" size="lg" />
        </span>
        <b>No permission matches</b>
        <p>Try another word, or show all modules.</p>
      </div>
    );
  }

  return (
    <div className={hf('table-wrap')}>
      <table className={hf('tbl matrix')} data-testid="permission-matrix">
        <thead>
          <tr>
            <th scope="col" className={hf('perm')}>
              Permission
            </th>
            {matrix.roles.map((r) => (
              <th key={r.roleId} scope="col" className={hf('rc', lockedRole(r.roleId) && 'lockcol')}>
                <Link href={`/roles/${r.roleId}`} style={{ color: 'inherit' }}>
                  {r.name}
                </Link>
                <small>{roleNote(r, lockedRole(r.roleId))}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((g) => (
            <Fragment key={g.module}>
              <tr className={hf('grp')}>
                <td role="rowheader" colSpan={matrix.roles.length + 1}>
                  {g.module}
                  {g.note && (
                    <>
                      {' '}
                      <span className={hf('muted')} style={{ fontWeight: 500 }}>
                        · {g.note}
                      </span>
                    </>
                  )}
                </td>
              </tr>
              {g.permissions.map((p) => (
                <tr key={p.key}>
                  <td role="rowheader" className={hf('perm')}>
                    <b style={{ fontWeight: 500 }}>{p.label}</b>
                    {p.hint && <small>{p.hint}</small>}
                  </td>
                  {matrix.roles.map((r) => {
                    const cell = p.cells[r.roleId];
                    const value = changes.valueOf(r.roleId, p.key);
                    const changed = changes.isChanged(r.roleId, p.key);
                    return (
                      <td key={r.roleId} className={hf('rc', changed && 'changed', lockedRole(r.roleId) && 'lockcol')}>
                        {scoped(p) ? (
                          <ScopeSelect permission={p.label} role={r.name} value={value} locked={cell?.locked ?? false} changed={changed} onChange={(v) => changes.set(r.roleId, p.key, v)} />
                        ) : (
                          <PermissionSwitch permission={p.label} role={r.name} checked={value.allowed} locked={cell?.locked ?? false} changed={changed} onChange={(on) => changes.set(r.roleId, p.key, { allowed: on, scope: null })} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
