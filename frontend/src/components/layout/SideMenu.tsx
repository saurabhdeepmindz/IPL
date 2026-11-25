/**
 * @file    SideMenu.tsx
 * @module  Ui
 *
 * @description
 * The left menu. In plain words: the administration menu of the wireframe; User Management, Role Management and Permission Management are live, the other modules are shown disabled.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/components/layout/SideMenu.tsx
 * @lld-synced     v0.26
 * @status         built
 */
import Link from 'next/link';
import { cn } from '@/lib/utils';

/** One entry of the menu. */
interface MenuItem {
  key: string;
  label: string;
  href?: string;
  sub?: boolean;
}

const MENU: MenuItem[] = [
  { key: 'dashboard', label: 'Admin Dashboard' },
  { key: 'access', label: 'User & Access Management' },
  { key: 'users', label: 'User Management', href: '/users', sub: true },
  { key: 'roles', label: 'Role Management', href: '/roles', sub: true },
  { key: 'permissions', label: 'Permission Management', href: '/permissions', sub: true },
  { key: 'masters', label: 'Master Data Management' },
  { key: 'workflow', label: 'Workflow Management' },
  { key: 'sla', label: 'SLA & Escalation Management' },
  { key: 'notifications', label: 'Notification Management' },
  { key: 'delegation', label: 'Delegation Management' },
  { key: 'audit', label: 'Audit & Compliance' },
  { key: 'reports', label: 'Reports & Analytics' },
];

/** Props of SideMenu. */
interface SideMenuProps {
  /** Key of the current item, for example `roles` */
  activeKey: string;
}

/**
 * Side menu. In plain words: the administration menu of the wireframe; Users, Roles and Permissions are links, the other modules are shown disabled and say they come later.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.5
 * @status    built
 *
 * @returns The rendered menu
 */
export function SideMenu({ activeKey }: SideMenuProps) {
  return (
    <nav aria-label="Administration" className="border-end bg-white p-3" data-testid="layout-menu">
      <p className="text-uppercase small text-body-secondary mb-2">Administration</p>
      <ul className="nav flex-column">
        {MENU.map((item) => (
          <li key={item.key} className={cn('nav-item', item.sub && 'ps-3')}>
            {item.href ? (
              <Link href={item.href} className={cn('nav-link', item.key === activeKey && 'active fw-bold')} aria-current={item.key === activeKey ? 'page' : undefined}>
                {item.label}
              </Link>
            ) : (
              <span className="nav-link disabled" aria-disabled="true">
                <span>{item.label}</span>
                <span className="visually-hidden"> (coming later)</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
