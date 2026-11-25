/**
 * @file    DeactivateUserDialog.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the deactivate dialog. In plain words: reason, with the proposals warning, with the last-administrator message; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-006
 * @subtask        ST-ADM01-006-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/stories/users/DeactivateUserDialog.stories.tsx
 * @lld-synced     v0.28
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, userEvent, within } from 'storybook/test';
import { DeactivateUserDialog } from '@/features/users/components/DeactivateUserDialog';
import type { UserDetails } from '@/features/users/types/user.types';

const user = { employeeCode: '20001', name: 'Anil Kumar', email: 'anil@example.invalid', department: 'Information Technology', designation: 'Senior Manager', companies: [], signIn: 'SSO', status: 'ACTIVE', lastSignIn: null, firstSignInAt: null, signInLocked: false, summaryText: '', activity: [], form: null } as UserDetails;

const meta = {
  title: 'Users/DeactivateUserDialog',
  component: DeactivateUserDialog,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <QueryClientProvider client={new QueryClient()}><Story /></QueryClientProvider>],
} satisfies Meta<typeof DeactivateUserDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: { user, onClose: () => undefined, onDone: () => undefined },
  play: async () => {
    const dialog = within(document.body).getByRole('dialog', { name: 'Deactivate Anil Kumar' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await expect(within(dialog).getByText('Choose a reason')).toBeVisible();
  },
};
