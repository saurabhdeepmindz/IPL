/**
 * @file    NoAccess.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the no-access message; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-018
 * @subtask        ST-ADM01-018-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.9
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/stories/ams/NoAccess.stories.tsx
 * @lld-synced     v0.30
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { NoAccess } from '@/components/ams/NoAccess';

const meta = { title: 'Ams/NoAccess', component: NoAccess, parameters: { layout: 'padded' }, args: { screen: 'User Management' } } satisfies Meta<typeof NoAccess>;
export default meta;
type Story = StoryObj<typeof meta>;

export const UserManagement: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('You do not have access to User Management.');
  },
};
export const RoleDetails: Story = { args: { screen: 'role details' } };
