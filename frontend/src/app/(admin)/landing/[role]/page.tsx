/**
 * @file    page.tsx
 * @module  Auth
 *
 * @description
 * The /landing/<page> routes of the dashboards that are not built yet. In plain words: shows the placeholder inside the main frame, with the main menu, for finance, initiator, inbox, reports and home; any other word is a 404.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-005
 * @subtask        ST-LGN03-005-FE-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1 (the route sits in the (admin) group so it has the frame)
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/app/(admin)/landing/[role]/page.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/layout/AdminShell';
import { RoleDashboardPlaceholder } from '@/features/auth/components/RoleDashboardPlaceholder';
import { dashboardName } from '@/features/auth/landing.map';

const PAGES = ['finance', 'initiator', 'inbox', 'reports', 'home'];

/**
 * LandingRoleRoute.
 *
 * In plain words: the address `/landing/<page>`.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-005
 * @subtask   ST-LGN03-005-FE-02
 * @workflow  UF-03
 * @ac        AC-US-LGN03-005-06
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @param props.params The page word of the address
 * @returns The placeholder in the main frame
 */
export default async function LandingRoleRoute(props: { params: Promise<{ role: string }> }) {
  const { role } = await props.params;
  if (!PAGES.includes(role)) notFound();
  const route = `/landing/${role}`;
  return (
    <AdminShell breadcrumbs={[{ label: 'Administration', href: '/dashboard' }, { label: dashboardName(route) }]}>
      <RoleDashboardPlaceholder route={route} />
    </AdminShell>
  );
}
