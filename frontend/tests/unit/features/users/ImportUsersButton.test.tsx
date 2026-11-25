/**
 * @file    ImportUsersButton.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest test of the Import users button on the user list. Written before the code.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users/ImportUsersButton.test.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listRoles } from '@/features/roles/services/roles.service';
import { ImportUsersButton } from '@/features/users/components/ImportUsersButton';
import { UserListPage } from '@/features/users/components/UserListPage';
import { getCompanies, getDepartments } from '@/features/users/services/masters.service';
import { listUsers } from '@/features/users/services/users.service';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/users', useSearchParams: () => new URLSearchParams('') }));
vi.mock('@/features/users/services/users.service', () => ({ listUsers: vi.fn() }));
vi.mock('@/features/users/services/masters.service', () => ({ getDepartments: vi.fn(), getCompanies: vi.fn(), getDesignations: vi.fn() }));
vi.mock('@/features/roles/services/roles.service', () => ({ listRoles: vi.fn() }));

describe('US-ADM01-009 the Import users button (supporting test)', () => {
  beforeEach(() => {
    vi.mocked(listUsers).mockResolvedValue({ items: [], counts: { all: 0, active: 0, inactive: 0, locked: 0 }, page: 1, pageSize: 25, total: 0 });
    vi.mocked(getDepartments).mockResolvedValue([]);
    vi.mocked(getCompanies).mockResolvedValue({ items: [], canViewAll: false });
    vi.mocked(listRoles).mockResolvedValue({ items: [] });
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-02
   * @subtask ST-ADM01-009-IN-02
   * In plain words: supporting test. The button is a link to /users/import, and the user list shows it next to Add user.
   */
  it('goes to the import page and shows on the user list', async () => {
    const { unmount } = render(<ImportUsersButton />);
    expect(screen.getByRole('link', { name: 'Import users' })).toHaveAttribute('href', '/users/import');
    unmount();
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <UserListPage />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole('link', { name: 'Import users' })).toHaveAttribute('href', '/users/import');
    expect(screen.getByRole('link', { name: 'Add user' })).toBeInTheDocument();
  });
});
