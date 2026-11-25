/**
 * @file    ReviewChangesPanel.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the review panel parts. In plain words: the rows, and the warning with its tick; the panel itself reads the API, so its cases are the Vitest and journey cases; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-016
 * @subtask        ST-ADM01-016-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/stories/permissions/ReviewChangesPanel.stories.tsx
 * @lld-synced     v0.28
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { ChangeRow } from '@/features/permissions/components/ChangeRow';
import { SensitiveWarning } from '@/features/permissions/components/SensitiveWarning';
import type { ReviewRow } from '@/features/permissions/types/permission.types';

const row: ReviewRow = { roleId: 'r1', roleName: 'Initiator', permissionKey: 'users.view', permissionLabel: 'View users', before: { allowed: false, scope: null }, after: { allowed: true, scope: null }, usersAffected: 12, sensitive: false, changed: true };
const scoped: ReviewRow = { ...row, permissionKey: 'proposals.view', permissionLabel: 'View proposals', before: { allowed: true, scope: 'OWN' }, after: { allowed: true, scope: 'COMPANY' } };

const meta = {
  title: 'Permissions/ReviewChangesPanel',
  component: SensitiveWarning,
  parameters: { layout: 'padded' },
  args: { warnings: [], confirmed: false, missing: false, onChange: () => undefined },
} satisfies Meta<typeof SensitiveWarning>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rows: Story = {
  render: () => (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Role</th>
          <th scope="col">Permission</th>
          <th scope="col">Before</th>
          <th scope="col">After</th>
          <th scope="col">Users affected</th>
        </tr>
      </thead>
      <tbody>
        <ChangeRow row={row} />
        <ChangeRow row={scoped} />
      </tbody>
    </table>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('row', { name: /View proposals/ })).toHaveTextContent('OwnCompany');
  },
};

export const WithWarning: Story = {
  args: { warnings: ['Manage users is a sensitive right and is being given to Initiator'] },
  play: async ({ canvasElement }) => {
    const tick = within(canvasElement).getByLabelText('I understand and confirm');
    await userEvent.click(tick);
  },
};

export const ConfirmMissing: Story = { args: { warnings: ['Manage users is a sensitive right and is being given to Initiator'], missing: true } };
