'use client';

/**
 * @file    AdminShell.tsx
 * @module  Layout
 *
 * @description
 * Administration frame. In plain words: sidebar, top bar, breadcrumb and content of the high-fidelity design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-017
 * @subtask        ST-ADM01-017-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM shell (all HF-ADM pages)
 * @status         built
 */

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '@/features/users/services/masters.service';
import { hf, HF_SCOPE_PAGE } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { ADMIN_NAV } from '@/hf/admin-nav';
import { useSessionStore } from '@/store/session.store';
import '@/styles/hf-admin.css';
import '@/styles/hf-overrides.css';

interface AdminShellProps {
  children: ReactNode;
  breadcrumbs: { label: string; href?: string }[];
}

const initials = (name: string): string => name.replace(/[^A-Z]/g, '').slice(0, 2) || name.slice(0, 2).toUpperCase();

/** The sidebar of the design: brand, groups with icons, the current screen marked, Collapse menu at the foot. */
function Sidebar({ path }: { path: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ access: true });
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={hf('sidebar')} data-collapsed={collapsed || undefined}>
      <Link className={hf('brand')} href="/dashboard" aria-label="IPL AMS home">
        <span className={hf('logo')}>
          IPL
          <br />
          logo
        </span>
        <span className={hf('txt')}>
          <b>IPL AMS</b>
          <small>Approval Management System</small>
        </span>
      </Link>
      <nav className={hf('nav')} aria-label="Administration" data-testid="layout-menu">
        <div className={hf('nav-label')}>Administration</div>
        {ADMIN_NAV.map((g) => {
          if (g.route) {
            return (
              <Link key={g.key} className={hf('nav-item', path === g.route && 'active')} href={g.route} title={g.label} aria-current={path === g.route ? 'page' : undefined}>
                <HfIcon name={g.icon} />
                <span>{g.label}</span>
              </Link>
            );
          }
          const active = g.items.some((i) => i.route && (path === i.route || path.startsWith(`${i.route}/`)));
          const isOpen = open[g.key] ?? false;
          const built = g.items.some((i) => i.route);
          return (
            <div key={g.key} className={hf('nav-group', isOpen && 'open', active && 'has-active')} aria-disabled={built ? undefined : true}>
              <button type="button" aria-expanded={isOpen} title={g.label} onClick={() => setOpen({ ...open, [g.key]: !isOpen })}>
                <HfIcon name={g.icon} />
                <span>{g.label}</span>
                <HfIcon name="chevR" size="sm" className={hf('chev')} />
              </button>
              <div className={hf('nav-sub')}>
                {g.items.map((i) => {
                  const here = !!i.route && (path === i.route || path.startsWith(`${i.route}/`));
                  return i.route ? (
                    <Link key={i.label} className={hf('nav-item', here && 'active')} href={i.route} aria-current={here ? 'page' : undefined}>
                      <span>{i.label}</span>
                    </Link>
                  ) : (
                    <span key={i.label} className={hf('nav-item')} aria-disabled="true">
                      <span>{i.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className={hf('sidebar-foot')}>
        <button className={hf('nav-item')} type="button" title="Collapse menu" onClick={() => setCollapsed(!collapsed)}>
          <HfIcon name="panelLeft" />
          <span>Collapse menu</span>
        </button>
      </div>
    </aside>
  );
}

/** The top bar of the design: notifications, company, financial year, workspace and the user. */
function TopBar() {
  const user = useSessionStore((s) => s.user);
  const companies = useQuery({ queryKey: ['masters.companies'], queryFn: getCompanies, staleTime: 5 * 60_000 });
  const company = companies.data?.items.find((c) => c.code === user?.companyCode);
  const name = user?.name ?? user?.employeeCode ?? '-';
  return (
    <header className={hf('topbar')} data-testid="layout-topbar">
      <div className={hf('ctx')}>
        <div className={hf('menu-wrap')}>
          <button className={hf('btn btn-text icon bell')} type="button" aria-label="Notifications (coming later)" disabled>
            <HfIcon name="bell" />
          </button>
        </div>
        <div className={hf('menu-wrap')}>
          <button className={hf('ctx-select')} type="button" aria-haspopup="true">
            <small>Company</small>
            <b>
              <HfIcon name="building" size="sm" />
              <span className={hf('co-name')} data-testid="layout-company">
                {company ? `${company.name} · ${company.code}` : (user?.companyCode ?? '-')}
              </span>
              <HfIcon name="chevD" size="sm" />
            </b>
          </button>
        </div>
        <div className={hf('menu-wrap fy')}>
          <button className={hf('ctx-select')} type="button" aria-haspopup="true">
            <small>Financial year</small>
            <b>
              <HfIcon name="calendar" size="sm" />
              <span className={hf('fy-name')}>FY 2026-27</span>
              <HfIcon name="chevD" size="sm" />
            </b>
          </button>
        </div>
        <div className={hf('ctx-select ws-fixed')}>
          <small>Workspace</small>
          <b>
            <HfIcon name="key" size="sm" />
            <span>Administrator</span>
          </b>
        </div>
        <div className={hf('menu-wrap')}>
          <button className={hf('profile')} type="button" aria-haspopup="true">
            <span className={hf('avatar')}>
              {initials(name)}
              <span className={hf('dot')} />
            </span>
            <span className={hf('who')}>
              <b data-testid="layout-user">{name}</b>
              <small>{user?.team ? `${user.team} · ` : ''}Administrator</small>
            </span>
            <HfIcon name="chevD" size="sm" />
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * AdminShell.
 *
 * In plain words: the frame of every Administration screen in the high-fidelity design: sidebar, top bar, breadcrumb and the content area. Built from the ported HF styles.
 */
export function AdminShell({ children, breadcrumbs }: AdminShellProps) {
  const path = usePathname() ?? '';
  return (
    <div className={HF_SCOPE_PAGE} data-testid="layout-shell">
      <div className={hf('app')}>
        <Sidebar path={path} />
        <div className={hf('main')}>
          <TopBar />
          <main className={hf('content')} id="main-content">
            <nav className={hf('crumbs')} aria-label="Breadcrumb" data-testid="layout-breadcrumbs">
              {breadcrumbs.map((c, i) => {
                const last = i === breadcrumbs.length - 1;
                return (
                  <span key={`${c.label}-${i}`} style={{ display: 'contents' }}>
                    {i > 0 && <span>/</span>}
                    {c.href && !last ? <Link href={c.href}>{c.label}</Link> : <span className={last ? hf('cur') : undefined} aria-current={last ? 'page' : undefined}>{c.label}</span>}
                  </span>
                );
              })}
            </nav>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
