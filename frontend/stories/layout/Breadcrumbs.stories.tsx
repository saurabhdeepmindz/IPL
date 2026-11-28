/**
 * @file    Breadcrumbs.stories.tsx
 * @module  Storybook
 *
 * @description
 * Story of the breadcrumb. In plain words: the path with links; the last step is the current screen and is not a link.
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
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

const meta = {
  title: 'Layout/Breadcrumbs',
  component: Breadcrumbs,
  parameters: { layout: 'padded', nextjs: { appDirectory: true } },
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeSteps: Story = {
  args: { items: [{ label: 'Administration', href: '/dashboard' }, { label: 'Role Management', href: '/roles' }, { label: 'Edit role' }] },
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Breadcrumb' });
    await expect(within(nav).getAllByRole('link')).toHaveLength(2);
    await expect(within(nav).getByText('Edit role')).toHaveAttribute('aria-current', 'page');
  },
};

export const OneStep: Story = {
  args: { items: [{ label: 'Administration' }] },
};
