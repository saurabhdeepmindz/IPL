/**
 * @file    Select.stories.tsx
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
import { Select } from '@/components/ui/Select';
import { expect, userEvent, within } from 'storybook/test';

const meta = { title: 'Components/Select', component: Select, parameters: { layout: 'padded' } } satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: 'IPL', label: 'IPL' },
  { value: 'IPLFB', label: 'IPLFB' },
  { value: 'OLD', label: 'Old company', disabled: true },
];

export const Default: Story = {
  args: { label: 'Company', options, placeholder: 'Select a company', hint: 'The company the user works in' },
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByLabelText('Company');
    await userEvent.selectOptions(select, 'IPLFB');
    await expect(select).toHaveValue('IPLFB');
  },
};
export const WithError: Story = { args: { label: 'Company', options, placeholder: 'Select a company', error: 'Pick a company' } };
export const Disabled: Story = { args: { label: 'Company', options, disabled: true } };
export const Loading: Story = { args: { label: 'Company', options: [], placeholder: 'Loading companies...', disabled: true } };
export const Empty: Story = { args: { label: 'Company', options: [], placeholder: 'No companies found' } };
