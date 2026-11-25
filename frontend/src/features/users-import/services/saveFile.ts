/**
 * @file    saveFile.ts
 * @module  UsersImport
 *
 * @description
 * Saves a file in the browser. In plain words: gives a Blob to the person as a download with the given name.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/services/saveFile.ts
 * @lld-synced     v0.30
 * @status         built
 */

/**
 * Starts a download.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-04
 * @param blob - the content
 * @param name - the file name
 */
export function saveFile(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
