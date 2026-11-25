'use client';

/**
 * @file    ImportUsersButton.tsx
 * @module  Users
 *
 * @description
 * The Import users button. In plain words: a link styled as a button on the user list that goes to /users/import; the page and the server decide who may use it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/ImportUsersButton.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import Link from 'next/link';

/**
 * Import users button.
 *
 * In plain words: a link styled as a button; the page and the server decide who may use it (decision L-128).
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-02
 * @ac       AC-US009-02
 */
export function ImportUsersButton() {
  return (
    <Link href="/users/import" className="btn btn-outline-secondary">
      Import users
    </Link>
  );
}
