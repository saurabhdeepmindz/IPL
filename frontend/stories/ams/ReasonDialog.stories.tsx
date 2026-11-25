/**
 * @file    ReasonDialog.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the reason dialog. In plain words: open, with an error, busy; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012, US-ADM01-013
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/stories/ams/ReasonDialog.stories.tsx
 * @lld-synced     v0.21
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { ReasonDialog } from '@/components/ams/ReasonDialog';
import { expect, userEvent, within } from 'storybook/test';

const meta = { title: 'Ams/ReasonDialog', component: ReasonDialog, parameters: { layout: 'padded' } } satisfies Meta<typeof ReasonDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

const base = { open: true, title: 'Reason for the change', onConfirm: () => undefined, onCancel: () => undefined };

export const Open: Story = {
  args: base,
  play: async () => {
    const dialog = within(document.body).getByRole('dialog', { name: 'Reason for the change' });
    await userEvent.click(within(dialog).getByTestId('reason-confirm'));
    await expect(within(dialog).getByText('Enter a reason')).toBeVisible();
  },
};
export const Busy: Story = { args: { ...base, busy: true } };
