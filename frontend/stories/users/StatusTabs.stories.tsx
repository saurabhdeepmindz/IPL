/**
 * @file    StatusTabs.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the status tabs. In plain words: counts and the chosen tab; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/stories/users/StatusTabs.stories.tsx
 * @lld-synced     v0.29
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { StatusTabs } from '@/features/users/components/StatusTabs';

const meta = { title: 'Users/StatusTabs', component: StatusTabs, parameters: { layout: 'padded' } } satisfies Meta<typeof StatusTabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AllUsers: Story = { args: { counts: { all: 142, active: 130, inactive: 9, locked: 3 }, value: 'all', onChange: () => undefined } };
export const LockedChosen: Story = { args: { counts: { all: 142, active: 130, inactive: 9, locked: 3 }, value: 'locked', onChange: () => undefined } };
