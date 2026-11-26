/**
 * @file    ImportUsersButton.tsx
 * @module  Users
 *
 * @description
 * Import users button. In plain words: the outlined button with the upload icon.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-FE-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-01 #list
 * @status         built
 */

import Link from 'next/link';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';

/**
 * ImportUsersButton.
 *
 * In plain words: the outlined "Import users" button with the upload icon (high-fidelity page head).
 */
export function ImportUsersButton() {
  return (
    <Link href="/users/import" className={hf('btn btn-outline')}>
      <HfIcon name="upload" />
      Import users
    </Link>
  );
}
