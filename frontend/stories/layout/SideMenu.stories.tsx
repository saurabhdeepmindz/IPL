/**
 * @file    SideMenu.stories.tsx
 * @module  Storybook
 *
 * @description
 * Story of the side menu. In plain words: the administration menu with one item active; the other modules are shown disabled.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R16-PS17
 * @status  built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { SideMenu } from '@/components/layout/SideMenu';

const meta = {
  title: 'Layout/SideMenu',
  component: SideMenu,
  parameters: { layout: 'padded', nextjs: { appDirectory: true } },
} satisfies Meta<typeof SideMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RolesActive: Story = {
  args: { activeKey: 'roles' },
  play: async ({ canvasElement }) => {
    const current = within(canvasElement).getAllByRole('link').find((l) => l.getAttribute('aria-current') === 'page');
    await expect(current).toHaveTextContent('Role Management');
  },
};

export const UsersActive: Story = {
  args: { activeKey: 'users' },
};
