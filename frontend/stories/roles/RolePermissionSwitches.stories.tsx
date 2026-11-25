/**
 * @file    RolePermissionSwitches.stories.tsx
 * @module  Stories
 *
 * @description
 * Story of the permission switches. In plain words: empty, some on, locked keys; the accessibility add-on must pass.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/stories/roles/RolePermissionSwitches.stories.tsx
 * @lld-synced     v0.29
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { RolePermissionSwitches } from '@/features/roles/components/RolePermissionSwitches';

const modules = [{ name: 'Users', permissions: [{ key: 'users.view', label: 'View users', hint: '', scoped: true }, { key: 'users.manage', label: 'Manage users', hint: '', scoped: false }] }];
const meta = { title: 'Roles/RolePermissionSwitches', component: RolePermissionSwitches, parameters: { layout: 'padded' } } satisfies Meta<typeof RolePermissionSwitches>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SomeOn: Story = { args: { modules, cells: [{ permissionKey: 'users.view', allowed: true, scope: 'COMPANY' }], onChange: () => undefined } };
export const Locked: Story = { args: { modules, cells: [{ permissionKey: 'users.manage', allowed: true }], onChange: () => undefined, lockedKeys: ['users.manage'] } };
