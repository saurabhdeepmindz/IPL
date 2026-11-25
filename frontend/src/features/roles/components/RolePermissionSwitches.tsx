/**
 * @file    RolePermissionSwitches.tsx
 * @module  RolesFeature
 *
 * @description
 * Permission switches by module. In plain words: one collapsible group per module with a switch per permission and a data scope list where the permission has one.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RolePermissionSwitches.tsx
 * @lld-synced     v0.27
 * @status         built
 */
import { Select, Switch } from '@/components/ui';
import type { CatalogModule, DataScope, PermissionCell } from '../types/role.types';

/** Props of RolePermissionSwitches. */
interface RolePermissionSwitchesProps {
  /** The catalog: modules with their permissions */
  modules: CatalogModule[];
  /** The current cells */
  cells: PermissionCell[];
  /** Called with the new cells */
  onChange: (cells: PermissionCell[]) => void;
  /** Keys that cannot be changed (the Administrator role) */
  lockedKeys?: string[];
}

const SCOPES = [
  { value: 'OWN', label: 'Own only' },
  { value: 'DEPARTMENT', label: 'Own department' },
  { value: 'COMPANY', label: 'Whole company' },
];

/**
 * Permission switches by module. In plain words: one group per module with a switch per permission and a data scope list where the permission has one; locked keys are disabled.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-02, AC-US012-04
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.5
 * @status    built
 *
 * @returns The rendered switches
 */
export function RolePermissionSwitches({ modules, cells, onChange, lockedKeys = [] }: RolePermissionSwitchesProps) {
  const cellOf = (key: string) => cells.find((c) => c.permissionKey === key);
  const set = (key: string, allowed: boolean, scope?: DataScope) => onChange([...cells.filter((c) => c.permissionKey !== key), { permissionKey: key, allowed, ...(scope ? { scope } : {}) }]);

  return (
    <div data-testid="roles-switches">
      {modules.map((m) => {
        const on = m.permissions.filter((p) => cellOf(p.key)?.allowed).length;
        return (
          <details key={m.name} open className="mb-3 border rounded p-2">
            <summary className="fw-semibold">
              {m.name} <span className="small text-body-secondary">{on} of {m.permissions.length} on</span>
            </summary>
            {m.permissions.map((p) => {
              const cell = cellOf(p.key);
              const locked = lockedKeys.includes(p.key);
              return (
                <div key={p.key} className="d-flex justify-content-between align-items-center py-1">
                  <Switch label={p.label} checked={cell?.allowed === true} disabled={locked} lockedReason={locked ? 'Locked for this role' : undefined} onChange={(v) => set(p.key, v, v && p.scoped ? (cell?.scope ?? 'COMPANY') : undefined)} />
                  {p.scoped && cell?.allowed && (
                    <Select label={`${p.label} scope`} options={SCOPES} value={cell.scope ?? 'COMPANY'} disabled={locked} onChange={(e) => set(p.key, true, e.target.value as DataScope)} />
                  )}
                </div>
              );
            })}
          </details>
        );
      })}
    </div>
  );
}
