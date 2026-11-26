'use client';

/**
 * @file    useImportRows.ts
 * @module  UsersImport
 *
 * @description
 * The two long calls as TanStack mutations. In plain words: check and import, each with a progress count.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/hooks/useImportRows.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersKeys } from '@/features/users';
import { checkAll, importAll } from '../services/usersImport.service';
import type { ImportRow } from '../types/import.types';

/**
 * Check mutation.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-04
 * @returns `{ run, isPending, progress, error }`; `run(rows)` gives the problems
 */
export function useCheckRows() {
  const [progress, setProgress] = useState(0);
  const mutation = useMutation({
    mutationFn: (rows: ImportRow[]) => {
      setProgress(0);
      return checkAll(rows, setProgress);
    },
  });
  return { run: mutation.mutateAsync, isPending: mutation.isPending, progress, error: mutation.error };
}

/**
 * Import mutation (the user list is read again after it).
 *
 * @returns `{ run, isPending, progress, error }`; `run(rows)` gives `{ created, problems }`
 */
export function useImportRows() {
  const [progress, setProgress] = useState(0);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (rows: ImportRow[]) => {
      setProgress(0);
      return importAll(rows, setProgress);
    },
    onSettled: () => client.invalidateQueries({ queryKey: usersKeys.all }),
  });
  return { run: mutation.mutateAsync, isPending: mutation.isPending, progress, error: mutation.error };
}
