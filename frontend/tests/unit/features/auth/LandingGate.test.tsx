/**
 * @file    LandingGate.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest cases of US-LGN03-005 (User lands on the dashboard of their role and can change company from the header). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-005
 * @subtask        ST-LGN03-005-FE-01
 * @lld            LLD-EPIC-LGN-03 v0.3 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/unit/features/auth/LandingGate.test.tsx
 * @lld-synced     v0.3
 * @status         elaborated
 */

import { describe, expect, it } from 'vitest';
import { LANDING_ROUTES, NEUTRAL_LANDING, dashboardName, isBuilt } from '@/features/auth/landing.map';

describe('User lands on the dashboard of their role and can change company from the header (US-LGN03-005)', () => {
  /** @tc TC-LGN03-005-J01 @story US-LGN03-005 @ac AC-US-LGN03-005-01 @subtask ST-LGN03-005-FE-02 In plain words: page and header case, written with the switcher (ST-LGN03-005-FE-02). */
  it.todo('TC-LGN03-005-J01 Given a user signed in to one company, when the user changes company in the header, then the session moves to the other company and one company only is active.');
  /** @tc TC-LGN03-005-J02 @story US-LGN03-005 @ac AC-US-LGN03-005-02 @subtask ST-LGN03-005-FE-02 In plain words: header case, written with the switcher (ST-LGN03-005-FE-02). */
  it.todo('TC-LGN03-005-J02 Given the header list, when it opens, then only valid companies of the user are listed and choosing one reopens the landing page of that company.');
  /** @tc TC-LGN03-005-J03 @story US-LGN03-005 @ac AC-US-LGN03-005-03 @subtask ST-LGN03-005-FE-02 In plain words: gate case, written with the gate (ST-LGN03-005-FE-02). */
  it.todo('TC-LGN03-005-J03 Given a user with one role, when the choice is saved, then the dashboard of that role opens.');
  /** @tc TC-LGN03-005-J04 @story US-LGN03-005 @ac AC-US-LGN03-005-04 @subtask ST-LGN03-005-FE-02 In plain words: gate case, written with the gate (ST-LGN03-005-FE-02). */
  it.todo('TC-LGN03-005-J04 Given a user with several roles, when the landing opens, then it follows the order Administrator, Finance, Initiator / Processor, Auditor / Report Viewer.');
  /** @tc TC-LGN03-005-J05 @story US-LGN03-005 @ac AC-US-LGN03-005-05 @subtask ST-LGN03-005-FE-02 In plain words: gate case, written with the gate (ST-LGN03-005-FE-02). */
  it.todo('TC-LGN03-005-J05 Given an initiator-only user, then the Initiator Dashboard opens; given an initiator who is also a processor, the Inbox.');

  /** @tc TC-LGN03-005-J06 @story US-LGN03-005 @ac AC-US-LGN03-005-06 @subtask ST-LGN03-005-FE-01 In plain words: only the dashboards of built modules count as built (the Admin Dashboard now); every other landing route is a placeholder page, so no user ever opens an address that leads nowhere. */
  it('TC-LGN03-005-J06 a dashboard that is not built yet is a placeholder page; only the Admin Dashboard is built', () => {
    expect(isBuilt('/dashboard')).toBe(true);
    for (const route of ['/landing/finance', '/landing/initiator', '/landing/inbox', '/landing/reports', NEUTRAL_LANDING]) expect(isBuilt(route)).toBe(false);
    expect(isBuilt('/anything/else')).toBe(false);
  });

  /** @story US-LGN03-005 @ac AC-US-LGN03-005-06 @subtask ST-LGN03-005-FE-01 In plain words: supporting test. The routes of the roles are the ones the AMS API returns, and each has a name for the page. */
  it('keeps the routes of the API and names every dashboard', () => {
    expect(LANDING_ROUTES).toEqual({ ADMINISTRATOR: '/dashboard', FINANCE: '/landing/finance', INITIATOR: '/landing/initiator', PROCESSOR: '/landing/inbox', AUDITOR: '/landing/reports', REPORT_VIEWER: '/landing/reports' });
    expect(NEUTRAL_LANDING).toBe('/landing/home');
    expect(dashboardName('/dashboard')).toBe('Admin Dashboard');
    expect(dashboardName('/landing/finance')).toBe('Finance Dashboard');
    expect(dashboardName('/landing/initiator')).toBe('Initiator Dashboard');
    expect(dashboardName('/landing/inbox')).toBe('Processor Dashboard');
    expect(dashboardName('/landing/reports')).toBe('Proposal dashboard');
    expect(dashboardName(NEUTRAL_LANDING)).toBe('Your workspace');
    for (const route of Object.values(LANDING_ROUTES)) expect(dashboardName(route)).not.toBe('');
  });
});
