/**
 * @file    admin-nav.ts
 * @module  HF
 *
 * @description
 * The Administration menu of the design. In plain words: groups, icons and screens; the built screens carry their route.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-017
 * @subtask        ST-ADM01-017-FE-01
 * @hf             HF-ADM shell
 * @source         built outside the LLD (a helper ported from the high-fidelity design)
 * @status         built
 */

import type { HfIconName } from './icons.generated';

/** The administration menu of the design: groups, their icon, and the screens inside. `route` is set only for screens that are built. */
export interface NavItem {
  label: string;
  route?: string;
}
export interface NavGroup {
  key: string;
  label: string;
  icon: HfIconName;
  items: NavItem[];
  route?: string;
}

export const ADMIN_NAV: NavGroup[] = [
  { key: 'dashboard', label: 'Admin Dashboard', icon: 'dashboard', items: [], route: '/dashboard' },
  { key: 'access', label: 'User & Access Management', icon: 'shield', items: [{ label: 'User Management', route: '/users' }, { label: 'Role Management', route: '/roles' }, { label: 'Permission Management', route: '/permissions' }] },
  { key: 'masters', label: 'Master Data Management', icon: 'database', items: [{ label: 'Master Data' }, { label: 'Excel Import', route: '/users/import' }, { label: 'SAP Masters' }] },
  { key: 'workflow', label: 'Workflow Management', icon: 'workflow', items: [{ label: 'Workflow Monitor' }, { label: 'Reassignment' }, { label: 'Routing Rules' }] },
  { key: 'sla', label: 'SLA & Escalation Management', icon: 'clock', items: [{ label: 'SLA Configuration' }, { label: 'SLA Monitoring' }] },
  { key: 'notifications', label: 'Notification Management', icon: 'mail', items: [{ label: 'Notification Templates' }, { label: 'Template Management' }] },
  { key: 'delegation', label: 'Delegation Management', icon: 'swap', items: [{ label: 'Delegation Management' }] },
  { key: 'audit', label: 'Audit & Compliance', icon: 'audit', items: [{ label: 'Audit Log Viewer' }] },
  { key: 'reports', label: 'Reports & Analytics', icon: 'chart', items: [{ label: 'Report Hub' }] },
];
