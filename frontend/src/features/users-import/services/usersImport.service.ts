/**
 * @file    usersImport.service.ts
 * @module  UsersImport
 *
 * @description
 * The two import calls and the sending in groups. In plain words: sends the rows in groups of 200 and joins the answers, with the progress count.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/services/usersImport.service.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { api } from '@/lib/api-client';
import type { ApiError } from '@/lib/errors';
import { GROUP_SIZE, type CheckAnswer, type ImportAnswer, type ImportRow, type Problem, type ServerProblem } from '../types/import.types';
import { problemsFromServer } from '../utils/mapUsersRows';

/** The problems of a group with no valid row: the server names them `rows.<n>.<field>`. */
function reportOf(error: ApiError): ServerProblem[] {
  return Object.entries(error.fields).flatMap(([key, message]) => {
    const m = /^rows\.(\d+)\.(.+)$/.exec(key);
    return m ? [{ row: Number(m[1]), field: m[2], message }] : [];
  });
}

/**
 * Checks every row on the server.
 *
 * In plain words: POST /users/import/check once per group of 200; nothing is saved.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-04
 * @ac       AC-US009-03
 * @param rows - the mapped rows
 * @param onProgress - called with the number of rows done
 * @returns The problems with Excel rows, columns and values
 */
export async function checkAll(rows: ImportRow[], onProgress?: (done: number) => void): Promise<Problem[]> {
  const problems: Problem[] = [];
  for (let offset = 0; offset < rows.length; offset += GROUP_SIZE) {
    const group = rows.slice(offset, offset + GROUP_SIZE);
    const res = await api.post<{ data: CheckAnswer }>('/users/import/check', { rows: group.map((r) => r.input) });
    problems.push(...problemsFromServer(res.data.data.failed, rows, offset));
    onProgress?.(offset + group.length);
  }
  return problems;
}

/**
 * Imports every row.
 *
 * In plain words: POST /users/import once per group of 200; a 422 BULK_IMPORT_FAILED of one group is that group's report, not an error of the whole import.
 *
 * @param rows - the rows that passed the check
 * @param onProgress - called with the number of rows done
 * @returns How many were created and the problems of the others
 */
export async function importAll(rows: ImportRow[], onProgress?: (done: number) => void): Promise<{ created: number; problems: Problem[] }> {
  let created = 0;
  const problems: Problem[] = [];
  for (let offset = 0; offset < rows.length; offset += GROUP_SIZE) {
    const group = rows.slice(offset, offset + GROUP_SIZE);
    const answer: ImportAnswer = await api
      .post<{ data: ImportAnswer }>('/users/import', { rows: group.map((r) => r.input) })
      .then((res) => res.data.data)
      .catch((error: ApiError) => {
        if (error.code !== 'BULK_IMPORT_FAILED') throw error;
        return { created: 0, failed: reportOf(error) };
      });
    created += answer.created;
    problems.push(...problemsFromServer(answer.failed, rows, offset));
    onProgress?.(offset + group.length);
  }
  return { created, problems };
}
