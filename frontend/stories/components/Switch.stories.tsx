/**
 * @file    Switch.stories.tsx
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
import { useState } from 'react';
import { Switch } from '@/components/ui/Switch';
import { expect, userEvent, within } from 'storybook/test';

const meta = { title: 'Components/Switch', component: Switch, parameters: { layout: 'padded' } } satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo(props: { label: string; initial: boolean; lockedReason?: string; disabled?: boolean; hint?: string }) {
  const [on, setOn] = useState(props.initial);
  return <Switch label={props.label} checked={on} onChange={setOn} lockedReason={props.lockedReason} disabled={props.disabled} hint={props.hint} />;
}

export const Default: Story = {
  args: { label: 'Allow export', checked: false, onChange: () => undefined },
  render: () => <Demo label="Allow export" initial={false} hint="Lets the role download reports" />,
  play: async ({ canvasElement }) => {
    const sw = within(canvasElement).getByRole('switch');
    await userEvent.tab();
    await expect(sw).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(sw).toBeChecked();
  },
};
export const On: Story = { args: { label: 'On', checked: true, onChange: () => undefined }, render: () => <Demo label="Manage users" initial /> };
export const Disabled: Story = { args: { label: 'Disabled', checked: false, onChange: () => undefined }, render: () => <Demo label="Disabled" initial={false} disabled /> };
export const Locked: Story = {
  args: { label: 'Locked', checked: true, onChange: () => undefined },
  render: () => <Demo label="Manage roles" initial lockedReason="Protected right of the Administrator" />,
};
