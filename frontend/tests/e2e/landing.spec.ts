/**
 * @file    landing.spec.ts
 * @module  Tests (journeys)
 *
 * @description
 * Playwright journey of the landing page and the company switch in the header. In plain words: real users with different roles sign in and choose a company; each lands on the page of the own role by the order Administrator, Finance, Initiator / Processor, Auditor / Report Viewer; a dashboard that is not built yet shows a simple page with the main menu; and the header lists only the user's valid companies and moves the session to the one chosen.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-005
 * @subtask        ST-LGN03-005-FE-03
 * @workflow       UF-03
 * @lld            LLD-EPIC-LGN-03 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/e2e/landing.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { expect, test, type Page } from '@playwright/test';
import { AUTH, PASSWORD, grantRoleInDatabase, makeLocalUser, removeMadeUsers, shot, submitPassword, tid } from './helpers/auth-journey';

const ADMIN_API = process.env.E2E_API_URL ?? 'http://localhost:3100/api/v1';

/** Signs in on /login, chooses a company (when several) and presses Continue on the company page. */
async function signInAndChoose(page: Page, code: string, company?: string): Promise<void> {
  await page.goto('/login');
  await submitPassword(page, code, PASSWORD);
  await page.waitForURL('**/choose-work');
  await tid(page, 'choose-company').waitFor();
  if (company) await tid(page, 'choose-co').selectOption(company);
  await tid(page, 'choose-go').click();
}

/** The company of the session, as the AMS API sees it: refreshes the token with the cookie and reads GET /me. */
async function sessionCompany(page: Page): Promise<string | undefined> {
  const refreshed = await page.request.post(`${AUTH}/auth/refresh`);
  const token = ((await refreshed.json()) as { data: { accessToken: string } }).data.accessToken;
  const me = await page.request.get(`${ADMIN_API}/me`, { headers: { authorization: `Bearer ${token}` } });
  return ((await me.json()) as { data: { context: { companyCode: string } | null } }).data.context?.companyCode;
}

/** A different person on a different device: no cookies and nothing remembered (the company page is skipped on a device that remembers the last choice). */
async function newDevice(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

const grant = (code: string, company: string, ...roles: string[]) => roles.forEach((r) => grantRoleInDatabase(code, r, company));

test.describe('User lands on the dashboard of their role and can change company from the header (US-LGN03-005)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN03-005-E01 @story US-LGN03-005 @ac AC-US-LGN03-005-01 @subtask ST-LGN03-005-FE-03 */
  test('TC-LGN03-005-E01 changing company in the header moves the session to the other company, and only one company is active', async ({ page }) => {
    const code = makeLocalUser();
    grant(code, 'IPL', 'ADMINISTRATOR');
    grant(code, 'IPLFB', 'AUDITOR');
    await signInAndChoose(page, code, 'IPL');
    await page.waitForURL('**/dashboard');
    await expect(tid(page, 'layout-company')).toContainText('IPL');
    expect(await sessionCompany(page)).toBe('IPL');
    await tid(page, 'company-switcher').click();
    await tid(page, 'switch-IPLFB').click();
    await page.waitForURL('**/landing/reports');
    await expect(tid(page, 'layout-company')).toContainText('IPLFB');
    expect(await sessionCompany(page)).toBe('IPLFB');
    await shot(page, 'TC-LGN03-005-E01_switched');
  });

  /** @tc TC-LGN03-005-E02 @story US-LGN03-005 @ac AC-US-LGN03-005-02 @subtask ST-LGN03-005-FE-03 */
  test('TC-LGN03-005-E02 the header list holds only the companies the user has today, and choosing one reopens its landing page', async ({ page }) => {
    const code = makeLocalUser();
    grant(code, 'IPL', 'ADMINISTRATOR');
    grantRoleInDatabase(code, 'AUDITOR', 'IPLFB', 5); // ended 5 days ago: not valid today
    await signInAndChoose(page, code);
    await page.waitForURL('**/dashboard');
    await tid(page, 'company-switcher').click();
    await expect(tid(page, 'company-menu').locator('[data-testid^="switch-"]')).toHaveCount(1);
    await expect(tid(page, 'switch-IPL')).toBeVisible();
    await expect(tid(page, 'switch-IPLFB')).toHaveCount(0);
    await tid(page, 'switch-IPL').click();
    await page.waitForURL('**/dashboard');
    await shot(page, 'TC-LGN03-005-E02_list');
  });

  /** @tc TC-LGN03-005-E03 @story US-LGN03-005 @ac AC-US-LGN03-005-03 @subtask ST-LGN03-005-FE-03 */
  test('TC-LGN03-005-E03 a user with one role lands on the dashboard of that role', async ({ page }) => {
    const code = makeLocalUser();
    grant(code, 'IPL', 'ADMINISTRATOR');
    await signInAndChoose(page, code);
    await expect(tid(page, 'opening')).toBeVisible();
    await expect(tid(page, 'opening')).toContainText('Opening your dashboard');
    await page.waitForURL('**/dashboard');
    await expect(tid(page, 'layout-menu')).toBeVisible();
    await shot(page, 'TC-LGN03-005-E03_dashboard');
  });

  /** @tc TC-LGN03-005-E04 @story US-LGN03-005 @ac AC-US-LGN03-005-04 @subtask ST-LGN03-005-FE-03 */
  test('TC-LGN03-005-E04 a user with several roles lands by the order Administrator, Finance, Initiator / Processor, Auditor / Report Viewer', async ({ page }) => {
    const finance = makeLocalUser();
    grant(finance, 'IPL', 'AUDITOR', 'FINANCE', 'INITIATOR');
    await signInAndChoose(page, finance);
    await page.waitForURL('**/landing/finance');
    await expect(tid(page, 'landing-placeholder')).toContainText('Finance Dashboard');
    await newDevice(page);
    const reports = makeLocalUser();
    grant(reports, 'IPL', 'REPORT_VIEWER', 'AUDITOR');
    await signInAndChoose(page, reports);
    await page.waitForURL('**/landing/reports');
    await expect(tid(page, 'landing-placeholder')).toContainText('Proposal dashboard');
  });

  /** @tc TC-LGN03-005-E05 @story US-LGN03-005 @ac AC-US-LGN03-005-05 @subtask ST-LGN03-005-FE-03 */
  test('TC-LGN03-005-E05 an initiator lands on the Initiator Dashboard; an initiator who is also a processor lands in the Inbox', async ({ page }) => {
    const initiator = makeLocalUser();
    grant(initiator, 'IPL', 'INITIATOR');
    await signInAndChoose(page, initiator);
    await page.waitForURL('**/landing/initiator');
    await expect(tid(page, 'landing-placeholder')).toContainText('Initiator Dashboard');
    await newDevice(page);
    const both = makeLocalUser();
    grant(both, 'IPL', 'INITIATOR', 'PROCESSOR');
    await signInAndChoose(page, both);
    await page.waitForURL('**/landing/inbox');
    await expect(tid(page, 'landing-placeholder')).toContainText('Processor Dashboard');
  });

  /** @tc TC-LGN03-005-E06 @story US-LGN03-005 @ac AC-US-LGN03-005-06 @subtask ST-LGN03-005-FE-03 */
  test('TC-LGN03-005-E06 a dashboard that is not built yet shows a simple page with the main menu and no error', async ({ page }) => {
    const code = makeLocalUser();
    grant(code, 'IPL', 'FINANCE');
    await signInAndChoose(page, code);
    await page.waitForURL('**/landing/finance');
    await expect(tid(page, 'landing-placeholder')).toContainText('Finance Dashboard');
    await expect(tid(page, 'landing-placeholder')).toContainText('not built yet');
    await expect(tid(page, 'layout-menu')).toBeVisible();
    await expect(tid(page, 'layout-shell')).not.toContainText(/error|went wrong|not allowed|do not have permission/i);
    await shot(page, 'TC-LGN03-005-E06_placeholder');
  });
});
