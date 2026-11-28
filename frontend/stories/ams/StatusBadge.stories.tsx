/**
 * @file    StatusBadge.stories.tsx
 * @module  Storybook
 *
 * @description
 * Story of the status badge. In plain words: the four statuses, each with a dot and the word.
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
import { StatusBadge } from '@/components/ams';

const meta = {
  title: 'Ams/StatusBadge',
  component: StatusBadge,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: { status: 'ACTIVE' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Active')).toBeInTheDocument();
  },
};

export const AllStatuses: Story = {
  args: { status: 'ACTIVE' },
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <StatusBadge status="ACTIVE" />
      <StatusBadge status="DRAFT" />
      <StatusBadge status="INACTIVE" />
      <StatusBadge status="LOCKED" />
    </div>
  ),
};
