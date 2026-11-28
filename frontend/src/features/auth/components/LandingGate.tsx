/**
 * @file    LandingGate.tsx
 * @module  Auth
 *
 * @description
 * The "Opening your dashboard" page (LGN-11). In plain words: after the company page (or a company switch in the header) the browser comes here; the page says where AMS opens (company, financial year, roles, dashboard) and opens the landing page after 2.5 seconds. "Go now" opens it at once; "Stay on this page" pauses. With no chosen landing (a direct visit or a refresh) the user goes back to the company page.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-005
 * @subtask        ST-LGN03-005-FE-02
 * @screen         LGN-11
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/components/LandingGate.tsx
 * @lld-synced     v0.4
 * @status         built
 */
'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/session.store';
import { hf } from '../hf/hf';
import { useMe } from '../hooks/useMe';
import { usePublicConfig } from '../hooks/usePublicConfig';
import { dashboardName } from '../landing.map';
import { AuthShell } from './AuthShell';

/** How long the page shows before it opens the landing page, in milliseconds (as in the design). */
export const OPENING_MS = 2500;

/**
 * LandingGate.
 *
 * In plain words: LGN-11. Reads the landing page from the session store and the company, roles and year for the list.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-005
 * @subtask   ST-LGN03-005-FE-02
 * @frd       FR-040.2, FR-040.4, FR-040.5
 * @workflow  UF-03
 * @screen    LGN-11
 * @ac        AC-US-LGN03-005-03, AC-US-LGN03-005-04, AC-US-LGN03-005-05, AC-US-LGN03-005-06
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @dependencies useSessionStore, useMe, dashboardName
 */
export function LandingGate() {
  const router = useRouter();
  const { data: config } = usePublicConfig();
  const { data: profile, isError } = useMe();
  const user = useSessionStore((s) => s.user);
  const landing = useSessionStore((s) => s.landing);
  const [paused, setPaused] = useState(false);
  // the session store is read from the browser after the first render; wait for it before deciding that no landing was chosen
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const route = landing?.route;
  useEffect(() => {
    if (mounted && !route) router.replace('/choose-work');
  }, [mounted, route, router]);
  useEffect(() => {
    if (!route || paused) return undefined;
    const timer = setTimeout(() => router.replace(route), OPENING_MS);
    return () => clearTimeout(timer);
  }, [route, paused, router]);
  const ready = route && (profile || isError);
  const company = profile?.companies.find((c) => c.code === user?.companyCode);
  return (
    <AuthShell helpEmail={config?.helpdesk.email ?? 'it.helpdesk@ipl.example'} wide>
      {ready ? (
        <div data-testid="opening">
          <div className={hf('spinner')} aria-hidden="true" hidden={paused} />
          <h1 id="t">{paused ? 'Where AMS opens for you' : 'Opening your dashboard…'}</h1>
          <p className={hf('sub')} id="s">
            Signed in as <b>{profile?.name ?? user?.name ?? user?.employeeCode}</b>. Your roles decide where AMS opens.
          </p>
          <dl className={hf('dl')} id="dl" style={{ gridTemplateColumns: '140px 1fr', marginBottom: 'var(--spacing-xl)' }}>
            <dt>Company</dt>
            <dd>{company ? `${company.name} · ${company.code}` : user?.companyCode}</dd>
            <dt>Financial year</dt>
            <dd>{user?.financialYear}</dd>
            <dt>Roles</dt>
            <dd>{company?.roles.join(', ')}</dd>
            <dt>Opens</dt>
            <dd>
              <b>{dashboardName(route)}</b>
            </dd>
          </dl>
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            <button className={hf('btn btn-primary')} id="goNow" type="button" data-testid="opening-go" onClick={() => router.replace(route)}>
              Go now
            </button>
            <button className={hf('btn btn-text')} id="stay" type="button" data-testid="opening-stay" onClick={() => setPaused(true)}>
              Stay on this page (review)
            </button>
          </div>
        </div>
      ) : null}
    </AuthShell>
  );
}
