/**
 * @file    page.tsx
 * @module  ComingSoon
 *
 * @description
 * Admin Dashboard route. In plain words: the placeholder until module ADM-A2 builds the dashboard.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-017
 * @subtask        ST-ADM01-017-FE-01
 * @hf             HF-ADM-00
 * @source         built outside the LLD (a placeholder screen of a later release)
 * @status         built
 */

import { AdminShell } from '@/components/layout/AdminShell';
import { ComingSoon } from '@/features/coming-soon/components/ComingSoon';

/**
 * Admin Dashboard route.
 *
 * In plain words: the Admin Dashboard (HF-ADM-00) belongs to a later release (module ADM-A2). Until then this page says so and offers the nearest built screen; the real dashboard replaces this page.
 */
export default function Page() {
  return (
    <AdminShell breadcrumbs={[{ label: 'Administration' }, { label: 'Admin Dashboard' }]}>
      <ComingSoon feature="Admin Dashboard" backHref="/users" backLabel="Back to User Management" />
    </AdminShell>
  );
}
