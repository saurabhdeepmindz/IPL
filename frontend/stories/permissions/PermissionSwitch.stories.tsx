/**
 * @file    PermissionSwitch.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the permission switch. In plain words: on, off, locked and changed; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/stories/permissions/PermissionSwitch.stories.tsx
 * @lld-synced     v0.29
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { PermissionSwitch } from '@/features/permissions/components/PermissionSwitch';

const meta = {
  title: 'Permissions/PermissionSwitch',
  component: PermissionSwitch,
  parameters: { layout: 'padded' },
  args: { permission: 'Create General proposal', role: 'Initiator', checked: false, locked: false, changed: false, onChange: () => undefined },
} satisfies Meta<typeof PermissionSwitch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('switch', { name: 'Create General proposal for Initiator' })).not.toBeChecked();
    await userEvent.tab();
  },
};
export const On: Story = { args: { checked: true } };
export const Locked: Story = {
  args: { checked: true, locked: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('switch')).toBeDisabled();
  },
};
export const Changed: Story = { args: { checked: true, changed: true } };
