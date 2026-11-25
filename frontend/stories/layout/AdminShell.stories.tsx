/**
 * @file    AdminShell.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the app shell. In plain words: the shell with the roles item active; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/stories/layout/AdminShell.stories.tsx
 * @lld-synced     v0.26
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { AdminShell } from '@/components/layout/AdminShell';
import { useSessionStore } from '@/store/session.store';
import { expect, within } from 'storybook/test';

const meta = {
  title: 'Layout/AdminShell',
  component: AdminShell,
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true, navigation: { pathname: '/roles' } } },
  decorators: [
    (Story) => {
      useSessionStore.getState().signIn({ userId: 'u1', employeeCode: '10002', companyCode: 'IPL' });
      return <Story />;
    },
  ],
} satisfies Meta<typeof AdminShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RolesActive: Story = {
  args: { breadcrumbs: [{ label: 'Administration' }, { label: 'Role Management' }], children: <h1 className="h3">Role Management</h1> },
  play: async ({ canvasElement }) => {
    const current = within(canvasElement).getAllByRole('link', { name: 'Role Management' }).find((l) => l.getAttribute('aria-current') === 'page');
    await expect(current).toBeDefined();
  },
};
