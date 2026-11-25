/**
 * @file    AdminShell.tsx
 * @module  Ui
 *
 * @description
 * The app shell of the administration screens. In plain words: the left menu, the top bar and the breadcrumb around every screen of the (admin) routes (decision L-63).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/components/layout/AdminShell.tsx
 * @lld-synced     v0.28
 * @status         built
 */
'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from './Breadcrumbs';
import { SideMenu } from './SideMenu';
import { TopBar } from './TopBar';

/** Props of AdminShell. */
interface AdminShellProps {
  /** The screen shown in the content area */
  children: ReactNode;
  /** The path shown above the title, for example Administration / Role Management */
  breadcrumbs: { label: string; href?: string }[];
}

const keyOf = (path: string): string => (['users', 'roles', 'permissions'].find((k) => path === `/${k}` || path.startsWith(`/${k}/`)) ?? 'access');

/**
 * Shell. In plain words: places the side menu, the top bar, the breadcrumb and the screen; the menu marks the current route; a skip link goes to the content.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.28 §6.5
 * @status    built
 *
 * @dependencies SideMenu, TopBar, Breadcrumbs
 *
 * @returns The rendered shell
 */
export function AdminShell({ children, breadcrumbs }: AdminShellProps) {
  const active = keyOf(usePathname() ?? '');
  return (
    <div className="d-flex" data-testid="layout-shell">
      <a href="#main-content" className="visually-hidden-focusable">
        Skip to content
      </a>
      <SideMenu activeKey={active} />
      <div className="flex-grow-1">
        <TopBar />
        <main id="main-content" className="p-4">
          <Breadcrumbs items={breadcrumbs} />
          {children}
        </main>
      </div>
    </div>
  );
}
