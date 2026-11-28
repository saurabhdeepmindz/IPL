/**
 * @file    AccessSummary.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest supporting tests of the access summary and the company table. In plain words: the plain-words text and the rows.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users/AccessSummary.test.tsx
 * @lld-synced     v0.30
 * @status         pseudo
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccessSummary } from '@/features/users/components/AccessSummary';
import { CompanyRoleTable } from '@/features/users/components/CompanyRoleTable';
import { getCompanies } from '@/features/directory/services/masters.service';
import { listRoleOptions } from '@/features/directory/services/directory.service';
import type { CompanyRoleInput } from '@/features/users/types/user.types';

vi.mock('@/features/directory/services/masters.service', () => ({ getCompanies: vi.fn(), getDepartments: vi.fn(), getDesignations: vi.fn() }));
vi.mock('@/features/directory/services/directory.service', () => ({ listRoleOptions: vi.fn() }));

const rows: CompanyRoleInput[] = [{ companyCode: 'IPL', roleIds: ['r1', 'r2'], validFrom: '2026-12-01' }, { companyCode: 'IPLFB', roleIds: ['r1'], validFrom: '2026-12-01' }];
const names = { r1: 'Initiator', r2: 'Auditor' };

function Harness() {
  const [value, setValue] = useState<CompanyRoleInput[]>([{ companyCode: 'IPL', roleIds: [], validFrom: '' }]);
  return <QueryClientProvider client={new QueryClient()}><CompanyRoleTable rows={value} onChange={setValue} /><output data-testid="rows">{value.length}</output></QueryClientProvider>;
}

describe('AccessSummary and CompanyRoleTable (supporting tests)', () => {
  /**
   * @story   US-ADM01-004
   * @ac      AC-US004-03
   * @subtask ST-ADM01-004-FE-02
   * In plain words: supporting test. The summary says how the user signs in and lists each company with its roles; with no row it says "No company access yet".
   */
  it('AccessSummary says it in plain words', () => {
    const { rerender } = render(<AccessSummary signIn="SSO" companies={rows} roleNames={names} />);
    expect(screen.getByText(/single sign-on/i)).toBeInTheDocument();
    expect(screen.getByText('IPL').closest('li')).toHaveTextContent('IPL: Initiator, Auditor');
    expect(screen.getByText('IPLFB').closest('li')).toHaveTextContent('IPLFB: Initiator');
    rerender(<AccessSummary signIn="LOCAL" companies={[]} roleNames={names} />);
    expect(screen.getByText(/local password/i)).toBeInTheDocument();
    expect(screen.getByText('No company access yet.')).toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-004
   * @ac      AC-US004-03
   * @subtask ST-ADM01-004-FE-02
   * In plain words: supporting test. Add company appends a row, Remove deletes it but never the last one, and a company already chosen cannot be chosen again.
   */
  it('CompanyRoleTable adds and removes rows', async () => {
    vi.mocked(getCompanies).mockResolvedValue({ items: [{ code: 'IPL', name: 'IPL' }, { code: 'IPLFB', name: 'IPLFB' }], canViewAll: false });
    vi.mocked(listRoleOptions).mockResolvedValue({ items: [] });
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Remove company 1' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Add company' }));
    expect(screen.getByTestId('rows')).toHaveTextContent('2');
    expect(await screen.findAllByRole('option', { name: /IPLFB/ })).toHaveLength(2);
    expect(screen.getByLabelText('Company', { selector: '#company-1' }).querySelector('option[value="IPL"]')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Remove company 2' }));
    expect(screen.getByTestId('rows')).toHaveTextContent('1');
  });
});
