/**
 * @file    useMatrixChanges.ts
 * @module  Permissions
 *
 * @description
 * Changes held in memory. In plain words: one entry per role and permission; a value put back to the saved one removes the entry (decision L-98).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/permissions/hooks/useMatrixChanges.ts
 * @lld-synced     v0.30
 * @status         built
 */
import { useCallback, useMemo, useState } from 'react';
import type { CellChange, CellValue, PermissionMatrixData } from '../types/permission.types';

const keyOf = (roleId: string, permissionKey: string): string => `${roleId}|${permissionKey}`;
/** Two values are the same when both are not allowed, or both are allowed with the same scope. */
const same = (a: CellValue, b: CellValue): boolean => a.allowed === b.allowed && (!a.allowed || a.scope === b.scope);
const NOTHING: CellValue = { allowed: false, scope: null };

/** What the hook gives. */
export interface MatrixChanges {
  /** The changes held in memory */
  changes: CellChange[];
  /** The value to show for a cell: the changed one or the saved one */
  valueOf: (roleId: string, permissionKey: string) => CellValue;
  /** True when the cell differs from the saved value */
  isChanged: (roleId: string, permissionKey: string) => boolean;
  /** Sets a cell; a value equal to the saved one removes the change */
  set: (roleId: string, permissionKey: string, value: CellValue) => void;
  /** Returns every cell to the saved state */
  discard: () => void;
}

/**
 * Matrix changes hook. In plain words: keeps the unsaved changes of the matrix, the counter and Discard changes.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-015
 * @subtask   ST-ADM01-015-FE-02
 * @frd       FR-043.1, FR-043.3, FR-043.6
 * @workflow  AD-03
 * @screen    ADM-03
 * @contract  API-PRM-01
 * @ac        AC-US015-04
 * @lld       LLD-EPIC-ADM-01 v0.27 §6.7
 * @status    built
 *
 * @returns The changes and their helpers
 */
export function useMatrixChanges(matrix: PermissionMatrixData | undefined): MatrixChanges {
  const [map, setMap] = useState<Map<string, CellChange>>(new Map());
  const saved = useMemo(() => {
    const out = new Map<string, CellValue>();
    for (const g of matrix?.groups ?? []) for (const p of g.permissions) for (const [roleId, c] of Object.entries(p.cells)) out.set(keyOf(roleId, p.key), { allowed: c.allowed, scope: c.scope });
    return out;
  }, [matrix]);

  const valueOf = useCallback((roleId: string, permissionKey: string): CellValue => {
    const k = keyOf(roleId, permissionKey);
    const changed = map.get(k);
    return changed ? { allowed: changed.allowed, scope: changed.scope } : (saved.get(k) ?? NOTHING);
  }, [map, saved]);

  const isChanged = useCallback((roleId: string, permissionKey: string): boolean => map.has(keyOf(roleId, permissionKey)), [map]);

  const set = useCallback((roleId: string, permissionKey: string, value: CellValue) => {
    setMap((before) => {
      const next = new Map(before);
      const k = keyOf(roleId, permissionKey);
      if (same(value, saved.get(k) ?? NOTHING)) next.delete(k);
      else next.set(k, { roleId, permissionKey, allowed: value.allowed, scope: value.scope });
      return next;
    });
  }, [saved]);

  const discard = useCallback(() => setMap(new Map()), []);
  return { changes: [...map.values()], valueOf, isChanged, set, discard };
}
