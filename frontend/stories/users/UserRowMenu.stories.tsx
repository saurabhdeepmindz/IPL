/**
 * @file    UserRowMenu.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the row menu. In plain words: a Locked user, a local user, an SSO user and an Inactive user; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-008
 * @subtask        ST-ADM01-008-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/stories/users/UserRowMenu.stories.tsx
 * @lld-synced     v0.30
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, userEvent, within } from 'storybook/test';
import { UserRowMenu } from '@/features/users/components/UserRowMenu';
import type { UserListItem } from '@/features/users/types/user.types';

const base: UserListItem = { employeeCode: '20001', name: 'Anil Kumar', email: 'anil@example.invalid', department: 'Finance', designation: 'Manager', companies: [], signIn: 'SSO', status: 'ACTIVE', lastSignIn: null };

const meta = {
  title: 'Users/UserRowMenu',
  component: UserRowMenu,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <QueryClientProvider client={new QueryClient()}><div style={{ minHeight: 220 }}><Story /></div></QueryClientProvider>],
  args: { user: base, place: 'list', onResult: () => undefined, onDeactivated: () => undefined },
} satisfies Meta<typeof UserRowMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LockedUser: Story = {
  args: { user: { ...base, status: 'LOCKED' } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Actions for Anil Kumar' }));
    await expect(within(canvasElement).getByRole('menuitem', { name: 'Unlock' })).toBeVisible();
  },
};
export const LocalUser: Story = { args: { user: { ...base, signIn: 'LOCAL' } } };
export const SsoUser: Story = {};
