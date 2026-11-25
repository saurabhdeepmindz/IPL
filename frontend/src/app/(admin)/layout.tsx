/**
 * @file    layout.tsx
 * @module  App
 *
 * @description
 * Layout of the administration routes. In plain words: wraps every (admin) page in the shell.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/app/(admin)/layout.tsx
 * @lld-synced     v0.25
 * @status         built
 */
import { Suspense, type ReactNode } from 'react';

/**
 * Admin layout. In plain words: thin; the pages of the (admin) routes show their own shell with their own breadcrumb, so the layout only holds a Suspense boundary (the shell reads the route and dynamic segments, which Next 16 needs behind one).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.25 §6.5
 * @status    built
 *
 * @dependencies AdminShell
 *
 * @returns The children
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p role="status">Loading…</p>}>{children}</Suspense>;
}
