/**
 * @file    NoAccessScreens.test.tsx
 * @module  Tests
 *
 * @description
 * Supporting tests of the no-access view. In plain words: the role list, the role details and the user details show it on a 403.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-018
 * @subtask        ST-ADM01-018-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.9
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/access/NoAccessScreens.test.tsx
 * @lld-synced     v0.29
 * @status         elaborated
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleDetailPage } from '@/features/roles/components/RoleDetailPage';
import { RoleListPage } from '@/features/roles/components/RoleListPage';
import { getPermissionCatalog, getRole, listRoles } from '@/features/roles/services/roles.service';
import { UserDetailPage } from '@/features/users/components/UserDetailPage';
import { getUser } from '@/features/users/services/users.service';
import { ApiError } from '@/lib/errors';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/', useSearchParams: () => new URLSearchParams('') }));
vi.mock('@/features/roles/services/roles.service', () => ({ listRoles: vi.fn(), getRole: vi.fn(), getPermissionCatalog: vi.fn(), createRole: vi.fn(), updateRole: vi.fn(), deactivateRole: vi.fn(), assignUsers: vi.fn() }));
vi.mock('@/features/users/services/users.service', () => ({ getUser: vi.fn() }));

const forbidden = new ApiError(403, 'FORBIDDEN', 'No');
const broken = new ApiError(500, 'ERROR', 'Down');
const wrap = (ui: React.ReactElement) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>);

describe('US-ADM01-018 no-access view on every screen (supporting tests)', () => {
  beforeEach(() => {
    for (const m of [listRoles, getRole, getPermissionCatalog, getUser]) vi.mocked(m).mockReset();
    vi.mocked(getPermissionCatalog).mockResolvedValue({ modules: [], cellsByRole: {} });
  });

  /**
   * @story   US-ADM01-018
   * @ac      AC-US018-01
   * @subtask ST-ADM01-018-IN-04
   * In plain words: supporting test. The role list shows "You do not have access to Role Management." on a 403.
   */
  it('the role list shows the no-access view on a 403', async () => {
    vi.mocked(listRoles).mockRejectedValue(forbidden);
    wrap(<RoleListPage />);
    expect(await screen.findByText('You do not have access to Role Management.')).toBeInTheDocument();
    expect(screen.queryByText(/could not be loaded/)).not.toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-018
   * @ac      AC-US018-01
   * @subtask ST-ADM01-018-IN-04
   * In plain words: supporting test. The role details show "You do not have access to role details." on a 403.
   */
  it('the role details show the no-access view on a 403', async () => {
    vi.mocked(getRole).mockRejectedValue(forbidden);
    wrap(<RoleDetailPage roleId="r1" />);
    expect(await screen.findByText('You do not have access to role details.')).toBeInTheDocument();
    expect(screen.queryByText(/could not be loaded/)).not.toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-018
   * @ac      AC-US018-01
   * @subtask ST-ADM01-018-IN-04
   * In plain words: supporting test. The user details show "You do not have access to user details." on a 403.
   */
  it('the user details show the no-access view on a 403', async () => {
    vi.mocked(getUser).mockRejectedValue(forbidden);
    wrap(<UserDetailPage employeeCode="20001" />);
    expect(await screen.findByText('You do not have access to user details.')).toBeInTheDocument();
    expect(screen.queryByText(/could not be loaded/)).not.toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-018
   * @ac      AC-US018-01
   * @subtask ST-ADM01-018-IN-04
   * In plain words: supporting test. Other errors keep their messages (the user list and the permission screen keep their words in their own tests).
   */
  it('other errors keep their messages', async () => {
    vi.mocked(listRoles).mockRejectedValue(broken);
    vi.mocked(getRole).mockRejectedValue(broken);
    vi.mocked(getUser).mockRejectedValue(broken);
    const a = wrap(<RoleListPage />);
    expect(await screen.findByText('The roles could not be loaded. Try again.')).toBeInTheDocument();
    a.unmount();
    const b = wrap(<RoleDetailPage roleId="r1" />);
    expect(await screen.findByText('The role could not be loaded. Try again.')).toBeInTheDocument();
    b.unmount();
    wrap(<UserDetailPage employeeCode="20001" />);
    expect(await screen.findByText('The user could not be loaded. Try again.')).toBeInTheDocument();
  });
});
