/**
 * @file    ShellSlots.stories.tsx
 * @module  Storybook
 *
 * @description
 * Story of the shell slots. In plain words: a feature hands the shell a piece through the provider and a component below it reads the piece; with no provider the slot is empty.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R18-S37
 * @status  built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { ShellSlotsProvider, useShellSlots } from '@/components/layout/ShellSlots';

/** Shows what the slot holds. */
function Reader() {
  const { companySwitcher } = useShellSlots();
  return <div data-testid="slot">{companySwitcher ?? 'empty'}</div>;
}

const meta = {
  title: 'Layout/ShellSlots',
  component: Reader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Reader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithCompanyBox: Story = {
  decorators: [
    (Story) => (
      <ShellSlotsProvider companySwitcher={<span>Company box</span>}>
        <Story />
      </ShellSlotsProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId('slot')).toHaveTextContent('Company box');
  },
};

export const WithoutProvider: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId('slot')).toHaveTextContent('empty');
  },
};
