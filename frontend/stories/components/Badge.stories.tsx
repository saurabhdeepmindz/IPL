/**
 * @file    Badge.stories.tsx
 * @module  Storybook
 *
 * @description
 * Story of the badge. In plain words: the badge in each look (colour, pill, with a dot); the text is always present, so colour is never the only signal.
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
import { Badge } from '@/components/ui/Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Active' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Active')).toBeInTheDocument();
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge variant="success">Success</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="dark">Dark</Badge>
    </div>
  ),
};

export const PillWithDot: Story = {
  args: { children: 'Locked', variant: 'danger', pill: true, dot: true },
};
