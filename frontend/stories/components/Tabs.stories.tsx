/**
 * @file    Tabs.stories.tsx
 * @module  Storybook
 *
 * @description
 * Storybook examples. In plain words: shows the component in each state, and checks the keyboard use in a play function.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from '@/components/ui/Tabs';
import { expect, userEvent, within } from 'storybook/test';

const meta = { title: 'Components/Tabs', component: Tabs, parameters: { layout: 'padded' } } satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

const tabs = [
  { id: 'all', label: 'All', count: 12, panel: <p>All users</p> },
  { id: 'active', label: 'Active', count: 9, panel: <p>Active users</p> },
  { id: 'locked', label: 'Locked', count: 1, panel: <p>Locked users</p> },
  { id: 'archived', label: 'Archived', disabled: true, panel: <p>Archived</p> },
];

export const Default: Story = {
  args: { ariaLabel: 'Users by status', tabs },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('tab', { name: /All/ }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(c.getByRole('tab', { name: /Active/ })).toHaveFocus();
    await expect(c.getByText('Active users')).toBeVisible();
  },
};
export const Empty: Story = { args: { ariaLabel: 'Empty', tabs: [{ id: 'a', label: 'Nothing yet', panel: <p>No records to show.</p> }] } };
