/**
 * @file    landing.resolver.ts
 * @module  AuthCoreModule
 *
 * @description
 * The landing choice. In plain words: picks the landing page of a user in a company by the role order Administrator, Finance, Initiator / Processor, Auditor / Report Viewer.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-002
 * @subtask        ST-LGN03-002-BE-02
 * @lld            LLD-EPIC-LGN-03 v0.2 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/core/src/auth/landing.resolver.ts
 * @lld-synced     v0.2
 * @status         built
 */

import { Injectable } from '@nestjs/common';

/** The landing route of each standard role; a module replaces its line when its dashboard is built (LLD L-04). */
export const LANDING_ROUTES: Record<string, string> = {
  ADMINISTRATOR: '/dashboard',
  FINANCE: '/landing/finance',
  INITIATOR: '/landing/initiator',
  PROCESSOR: '/landing/inbox',
  AUDITOR: '/landing/reports',
  REPORT_VIEWER: '/landing/reports',
};

/** The neutral placeholder for a user who holds only custom roles (suggested, IPL to confirm). */
export const NEUTRAL_LANDING = '/landing/home';

/**
 * LandingResolver.
 *
 * In plain words: finds the first role of the configured order that the user has and returns the page of that role.
 *
 * @rtm
 *   epics:     EPIC-LGN-03
 *   stories:   US-LGN03-002
 *   workflows: UF-03
 *   frd:       FR-040.4, FR-040.5
 *   contracts: API-ME-02
 *   ac:        AC-US-LGN03-002-04, AC-US-LGN03-002-05, AC-US-LGN03-002-06
 *   lld:       LLD-EPIC-LGN-03 v0.2 section 6.0
 */
@Injectable()
export class LandingResolver {
  /**
   * resolve.
   *
   * In plain words: goes through the configured order and picks the first role the user has; an initiator who is also a processor gets the Inbox; a user with only custom roles gets the neutral placeholder.
   *
   * @epic      EPIC-LGN-03
   * @story     US-LGN03-002
   * @subtask   ST-LGN03-002-BE-02
   * @frd       FR-040.4, FR-040.5
   * @workflow  UF-03
   * @contract  API-ME-02
   * @ac        AC-US-LGN03-002-04, AC-US-LGN03-002-05, AC-US-LGN03-002-06
   * @lld       LLD-EPIC-LGN-03 v0.2 §6.0
   * @status    built
   *
   * @dependencies none
   *
   * @param roles The role codes the user holds in the chosen company (at least one)
   * @param order The role codes in landing order (the setting `landing.order`)
   * @returns The role and the route of the landing page
   */
  resolve(roles: string[], order: string[]): { role: string; route: string } {
    const first = order.find((code) => roles.includes(code));
    if (!first) return { role: roles[0] ?? '', route: NEUTRAL_LANDING };
    const role = first === 'INITIATOR' && roles.includes('PROCESSOR') ? 'PROCESSOR' : first;
    return { role, route: LANDING_ROUTES[role] ?? NEUTRAL_LANDING };
  }
}
