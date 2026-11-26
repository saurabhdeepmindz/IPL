'use client';

/**
 * @file    RolePermissionSwitches.tsx
 * @module  Roles
 *
 * @description
 * Permission box. In plain words: the folding modules with toggles and scope drop-downs of the design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-02 #new, #edit
 * @status         built
 */

import { useState } from 'react';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import type { CatalogModule, DataScope, PermissionCell } from '../types/role.types';

interface RolePermissionSwitchesProps {
  modules: CatalogModule[];
  cells: PermissionCell[];
  onChange: (cells: PermissionCell[]) => void;
  lockedKeys?: string[];
}

const SCOPES = [
  { value: 'OWN', label: 'Own only' },
  { value: 'DEPARTMENT', label: 'Own department' },
  { value: 'COMPANY', label: 'Whole company' },
];

/**
 * RolePermissionSwitches.
 *
 * In plain words: the "Permissions by module" box of the high-fidelity design: one folding block per module with "n of m on", a toggle for a plain permission and a drop-down (Not allowed, Own only, Own department, Whole company) for a permission that has a data scope.
 */
export function RolePermissionSwitches({ modules, cells, onChange, lockedKeys = [] }: RolePermissionSwitchesProps) {
  const [shut, setShut] = useState<Record<string, boolean>>({});
  const cellOf = (key: string) => cells.find((c) => c.permissionKey === key);
  const set = (key: string, allowed: boolean, scope?: DataScope) => onChange([...cells.filter((c) => c.permissionKey !== key), { permissionKey: key, allowed, ...(scope ? { scope } : {}) }]);

  return (
    <div data-testid="roles-switches">
      {modules.map((m, i) => {
        const on = m.permissions.filter((p) => cellOf(p.key)?.allowed).length;
        const open = shut[m.name] === undefined ? i < 2 : !shut[m.name];
        const toggle = () => setShut({ ...shut, [m.name]: open });
        return (
          <div key={m.name} className={hf('perm-mod', open && 'open')}>
            <header tabIndex={0} role="button" aria-expanded={open} onClick={toggle} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()}>
              <HfIcon name="chevR" size="sm" className={hf('chev')} />
              <b>{m.name}</b>
              {m.note && <span className={hf('badge b-neutral plain')}>{m.note}</span>}
              <small>
                {on} of {m.permissions.length} on
              </small>
            </header>
            <div className={hf('pl')}>
              {m.permissions.map((p) => {
                const cell = cellOf(p.key);
                const locked = lockedKeys.includes(p.key);
                return (
                  <div key={p.key} className={hf('perm')}>
                    <span>
                      {p.label}
                      {p.hint && <small>{p.hint}</small>}
                    </span>
                    {p.scoped ? (
                      <select
                        className={hf('select')}
                        aria-label={`${p.label} scope`}
                        disabled={locked}
                        title={locked ? 'Locked for this role' : undefined}
                        value={cell?.allowed ? (cell.scope ?? 'COMPANY') : ''}
                        onChange={(e) => (e.target.value ? set(p.key, true, e.target.value as DataScope) : set(p.key, false))}
                      >
                        <option value="">Not allowed</option>
                        {SCOPES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <label className={hf('toggle')} title={locked ? 'Locked for this role' : undefined}>
                        <input type="checkbox" role="switch" aria-label={p.label} checked={cell?.allowed === true} disabled={locked} onChange={(e) => set(p.key, e.target.checked)} />
                        <span className={hf('track')} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
