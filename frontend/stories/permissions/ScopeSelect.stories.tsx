/**
 * @file    ScopeSelect.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the scope list. In plain words: No access, Own, Department, Company, locked and changed; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/stories/permissions/ScopeSelect.stories.tsx
 * @lld-synced     v0.30
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { ScopeSelect } from '@/features/permissions/components/ScopeSelect';

const meta = {
  title: 'Permissions/ScopeSelect',
  component: ScopeSelect,
  parameters: { layout: 'padded' },
  args: { permission: 'View proposals', role: 'Initiator', value: { allowed: true, scope: 'OWN' }, locked: false, changed: false, onChange: () => undefined },
} satisfies Meta<typeof ScopeSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Own: Story = {
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('combobox', { name: 'View proposals for Initiator' });
    await expect(list).toHaveValue('OWN');
    await expect(within(list).getAllByRole('option')).toHaveLength(4);
  },
};
export const NoAccess: Story = { args: { value: { allowed: false, scope: null } } };
export const Locked: Story = { args: { value: { allowed: true, scope: 'COMPANY' }, locked: true } };
export const Changed: Story = { args: { value: { allowed: true, scope: 'DEPARTMENT' }, changed: true } };
