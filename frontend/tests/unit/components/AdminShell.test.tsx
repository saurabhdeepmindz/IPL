/**
 * @file    AdminShell.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest supporting tests of the app shell (written before the code). In plain words: the menu marks the current screen, disabled modules cannot be focused, the top bar shows the company and the user, the breadcrumb ends on the current screen.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012, US-ADM01-013
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/unit/components/AdminShell.test.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminShell } from '@/components/layout/AdminShell';
import { useSessionStore } from '@/store/session.store';

vi.mock('next/navigation', () => ({ usePathname: () => '/roles/abc', useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock('@/lib/api-client', () => ({ api: { get: vi.fn().mockRejectedValue(new Error('offline')), put: vi.fn() } }));
vi.mock('@/features/users/services/masters.service', () => ({ getCompanies: vi.fn().mockResolvedValue({ items: [], canViewAll: false }) }));
const render = (ui: ReactElement) => rtlRender(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

const crumbs = [{ label: 'Administration' }, { label: 'Role Management', href: '/roles' }, { label: 'Create role' }];

describe('AdminShell (supporting tests)', () => {
  beforeEach(() => {
    useSessionStore.getState().signIn({ userId: 'u1', employeeCode: '10002', companyCode: 'IPL' });
  });

  /**
   * @story     US-ADM01-012, US-ADM01-013
   * @ac        AC-US012-01
   * @subtask   ST-ADM01-012-FE-04
   * In plain words: supporting test. The Role Management item is the current page; Users and Permissions are live links; another module is disabled and is not a link.
   */
  it('marks the current menu item and disables the other modules', () => {
    render(<AdminShell breadcrumbs={crumbs}><p>content</p></AdminShell>);
    expect(screen.getAllByRole('link', { name: 'Role Management' }).some((l) => l.getAttribute('aria-current') === 'page')).toBe(true);
    expect(screen.getByRole('link', { name: 'User Management' })).toHaveAttribute('href', '/users');
    expect(screen.getByRole('link', { name: 'Permission Management' })).toHaveAttribute('href', '/permissions');
    // The group of a later release is a folding button; its screens open the Coming soon page.
    expect(screen.queryByRole('link', { name: 'Workflow Management' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Workflow Monitor' })).toHaveAttribute('href', '/coming-soon?feature=Workflow%20Monitor');
    expect(screen.getByRole('link', { name: /Notifications/ })).toHaveAttribute('href', '/coming-soon?feature=Notifications');
  });

  /**
   * @story     US-ADM01-012, US-ADM01-013
   * @ac        AC-US012-01
   * @subtask   ST-ADM01-012-FE-04
   * In plain words: supporting test. The top bar shows the company and the employee code; the breadcrumb ends on the current screen; the content sits in the main landmark.
   */
  it('shows the session, the breadcrumb and the content', () => {
    render(<AdminShell breadcrumbs={crumbs}><p>content</p></AdminShell>);
    expect(screen.getByTestId('layout-company')).toHaveTextContent('IPL');
    expect(screen.getByTestId('layout-user')).toHaveTextContent('10002');
    expect(screen.getByText('Create role')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('main')).toHaveTextContent('content');
  });
});
