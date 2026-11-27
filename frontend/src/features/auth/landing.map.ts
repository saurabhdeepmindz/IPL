/**
 * @file    landing.map.ts
 * @module  Auth
 *
 * @description
 * The landing map. In plain words: the page each role lands on, the name of each dashboard, and which dashboards are built. When a module builds its dashboard, one line changes here and the placeholder page is no longer used.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-005
 * @subtask        ST-LGN03-005-FE-01
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/landing.map.ts
 * @lld-synced     v0.3
 * @status         built
 */

/**
 * landing.map.
 *
 * In plain words: routes and names of the landing pages (the same routes as the AMS API returns in API-ME-02).
 *
 * @rtm
 *   epics:     EPIC-LGN-03
 *   stories:   US-LGN03-005
 *   workflows: UF-03
 *   ac:        AC-US-LGN03-005-06
 *   lld:       LLD-EPIC-LGN-03 v0.3 section 6.1
 */

/** The landing route of each standard role. */
export const LANDING_ROUTES: Record<string, string> = {
  ADMINISTRATOR: '/dashboard',
  FINANCE: '/landing/finance',
  INITIATOR: '/landing/initiator',
  PROCESSOR: '/landing/inbox',
  AUDITOR: '/landing/reports',
  REPORT_VIEWER: '/landing/reports',
};

/** The neutral page of a user who holds only custom roles (suggested, IPL to confirm). */
export const NEUTRAL_LANDING = '/landing/home';

/**
 * The routes whose dashboards are built. A module adds its route here when its dashboard exists.
 * Until then the placeholder opens; each missing route and the module that replaces it are in the Coming soon register (docs/module-checklist/MODULE-CHECKLIST.md, section 5b):
 * /landing/finance (FIN), /landing/initiator (INI), /landing/inbox (FPR), /landing/reports (RPT), /landing/home (LGN, after IPL answers decision L-29).
 */
const BUILT_DASHBOARDS: readonly string[] = ['/dashboard'];

/** The name of each dashboard, as the design calls it. */
const DASHBOARD_NAMES: Record<string, string> = {
  '/dashboard': 'Admin Dashboard',
  '/landing/finance': 'Finance Dashboard',
  '/landing/initiator': 'Initiator Dashboard',
  '/landing/inbox': 'Processor Dashboard',
  '/landing/reports': 'Proposal dashboard',
  [NEUTRAL_LANDING]: 'Your workspace',
};

/**
 * isBuilt.
 *
 * In plain words: says whether the dashboard of a landing route is built; if not, the placeholder page opens instead.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-005
 * @subtask   ST-LGN03-005-FE-01
 * @workflow  UF-03
 * @ac        AC-US-LGN03-005-06
 * @lld       LLD-EPIC-LGN-03 v0.3 §6.1
 * @status    built
 *
 * @param route The landing route
 * @returns True for the routes of built dashboards
 */
export function isBuilt(route: string): boolean {
  return BUILT_DASHBOARDS.includes(route);
}

/**
 * dashboardName.
 *
 * In plain words: the name shown on the opening page and on the placeholder page.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-005
 * @subtask   ST-LGN03-005-FE-01
 * @ac        AC-US-LGN03-005-06
 * @lld       LLD-EPIC-LGN-03 v0.3 §6.1
 * @status    built
 *
 * @param route The landing route
 * @returns The name of the dashboard, or "Your workspace" for a route that is not in the map
 */
export function dashboardName(route: string): string {
  return DASHBOARD_NAMES[route] ?? 'Your workspace';
}
