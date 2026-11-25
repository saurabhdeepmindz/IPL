/**
 * @file    PermissionMatrix.tsx
 * @module  Permissions
 *
 * @description
 * The grid. In plain words: roles across with the user counts, permissions down in module groups, sticky permission column and header row (decisions L-95 to L-100, L-102).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/components/PermissionMatrix.tsx
 * @lld-synced     v0.27
 * @status         built
 */
'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import type { MatrixChanges } from '../hooks/useMatrixChanges';
import type { MatrixPermission, PermissionMatrixData } from '../types/permission.types';
import { PermissionSwitch } from './PermissionSwitch';
import { ScopeSelect } from './ScopeSelect';

const STICKY_LEFT = { position: 'sticky', left: 0, zIndex: 1, background: 'var(--bs-body-bg, #fff)' } as const;
const STICKY_TOP = { position: 'sticky', top: 0, zIndex: 2, background: 'var(--bs-body-bg, #fff)' } as const;

/** True when the permission has a data scope in any role (it is shown as a list). */
const scoped = (p: MatrixPermission): boolean => Object.values(p.cells).some((c) => c.scope !== null);

/** Props of PermissionMatrix. */
interface PermissionMatrixProps {
  /** The matrix as saved */
  matrix: PermissionMatrixData;
  /** The unsaved changes */
  changes: MatrixChanges;
  /** The text to find in the label, hint or key */
  search: string;
  /** The module to show; empty for all */
  module: string;
  /** True to show only the rows that have a changed cell */
  changedOnly: boolean;
}

/**
 * The matrix. In plain words: one row per permission under its module; a switch or a scope list in each cell; the rows narrow with the search, the module and Show changed only.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-015
 * @subtask   ST-ADM01-015-FE-02
 * @frd       FR-043.1, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US015-01, 02, 03, 04, 05
 * @lld       LLD-EPIC-ADM-01 v0.27 §6.7
 * @status    built
 *
 * @dependencies PermissionSwitch, ScopeSelect
 *
 * @returns The rendered output
 */
export function PermissionMatrix({ matrix, changes, search, module, changedOnly }: PermissionMatrixProps) {
  const needle = search.trim().toLowerCase();
  const rows = matrix.groups
    .filter((g) => !module || g.module === module)
    .map((g) => ({
      module: g.module,
      permissions: g.permissions.filter((p) => {
        if (needle && !`${p.label} ${p.hint} ${p.key}`.toLowerCase().includes(needle)) return false;
        if (changedOnly && !matrix.roles.some((r) => changes.isChanged(r.roleId, p.key))) return false;
        return true;
      }),
    }))
    .filter((g) => g.permissions.length > 0);

  if (rows.length === 0) return <p data-testid="matrix-empty">No permissions match your filters</p>;

  return (
    <div className="table-responsive" style={{ maxHeight: '70vh' }}>
      <table className="table align-middle" data-testid="permission-matrix">
        <thead>
          <tr>
            <th scope="col" style={{ ...STICKY_TOP, ...STICKY_LEFT, zIndex: 3 }}>Permission</th>
            {matrix.roles.map((r) => (
              <th key={r.roleId} scope="col" className="text-center" style={STICKY_TOP}>
                <Link href={`/roles/${r.roleId}`}>{r.name}</Link>
                <div className="small text-body-secondary fw-normal">{r.userCount === 1 ? '1 user' : `${r.userCount} users`}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((g) => (
            <Fragment key={g.module}>
              <tr className="table-light">
                <th scope="row" colSpan={matrix.roles.length + 1}>{g.module}</th>
              </tr>
              {g.permissions.map((p) => (
                <tr key={p.key}>
                  <th scope="row" className="fw-normal" style={STICKY_LEFT}>
                    {p.label}
                    {p.hint && <div className="small text-body-secondary">{p.hint}</div>}
                  </th>
                  {matrix.roles.map((r) => {
                    const cell = p.cells[r.roleId];
                    const value = changes.valueOf(r.roleId, p.key);
                    const changed = changes.isChanged(r.roleId, p.key);
                    return (
                      <td key={r.roleId} className="text-center">
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
