/**
 * @file    CompanyRoleTable.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the company access table. In plain words: one row, two rows, with errors; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/stories/users/CompanyRoleTable.stories.tsx
 * @lld-synced     v0.25
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompanyRoleTable } from '@/features/users/components/CompanyRoleTable';

const meta = {
  title: 'Users/CompanyRoleTable',
  component: CompanyRoleTable,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <QueryClientProvider client={new QueryClient()}><Story /></QueryClientProvider>],
} satisfies Meta<typeof CompanyRoleTable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const OneRow: Story = { args: { rows: [{ companyCode: '', roleIds: [], validFrom: '' }], onChange: () => undefined } };
export const WithErrors: Story = { args: { rows: [{ companyCode: 'IPL', roleIds: [], validFrom: '2026-12-02', validTo: '2026-12-01' }], onChange: () => undefined, errors: { companies: 'Give the user at least one company with one role', 'companies.0.validTo': 'Valid-to must not be before valid-from' } } };
