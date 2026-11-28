/**
 * @file    page.tsx
 * @module  ComingSoon
 *
 * @description
 * Coming soon route. In plain words: shows the placeholder for the named feature.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-017
 * @subtask        ST-ADM01-017-FE-01
 * @hf             Coming soon (any HF screen of a later release)
 * @source         built outside the LLD (a placeholder screen of a later release)
 * @status         built
 */

import { AdminShell } from '@/components/layout/AdminShell';
import { ComingSoon } from '@/features/coming-soon/components/ComingSoon';

interface PageProps {
  searchParams: Promise<{ feature?: string }>;
}

/**
 * Coming soon route.
 *
 * In plain words: `/coming-soon?feature=<name>` shows the placeholder for a screen that a later release builds (menu items, the notification bell).
 */
export default async function Page(props: PageProps) {
  const { feature } = await props.searchParams;
  const name = (feature ?? 'This screen').slice(0, 80);
  return (
    <AdminShell breadcrumbs={[{ label: 'Administration', href: '/dashboard' }, { label: name }]}>
      <ComingSoon feature={name} />
    </AdminShell>
  );
}
