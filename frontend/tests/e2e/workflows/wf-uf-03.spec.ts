/**
 * @file    wf-uf-03.spec.ts
 * @module  Tests (workflow journeys)
 *
 * @description
 * Workflow journey UF-03 (company, financial year and landing), steps 1 to 11, end to end in the browser. In plain words: real users of different companies and roles sign in; each sees only the own companies and the own company's data; each lands on the page of the own role; a user with two companies switches company from the header; a user without a company is told whom to call.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-007
 * @subtask        ST-LGN03-007-IN-02
 * @workflow       WF-UF-03
 * @lld            LLD-EPIC-LGN-03 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/e2e/workflows/wf-uf-03.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { expect, test, type Page } from '@playwright/test';
import { PASSWORD, grantRoleInDatabase, makeLocalUser, removeMadeUsers, shot, submitPassword, tid } from '../helpers/auth-journey';

/** A different person on a different device: no cookies and nothing remembered. */
async function newDevice(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto('/login?dev=1');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/** Signs in on /login with the known password and returns when the next page has opened. */
async function signIn(page: Page, code: string): Promise<void> {
  await newDevice(page);
  await page.goto('/login');
  await submitPassword(page, code, PASSWORD);
}

test.describe('QA engineer verifies company separation and landing end to end (US-LGN03-007)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN03-007-E01 @story US-LGN03-007 @ac AC-US-LGN03-007-01 @subtask ST-LGN03-007-IN-02 */
  test('WF-UF-03 TC-LGN03-007-E01 two users of different companies each see only the own companies and the own company data', async ({ page }) => {
    const a = makeLocalUser();
    const b = makeLocalUser();
    grantRoleInDatabase(a, 'ADMINISTRATOR', 'IPL');
    grantRoleInDatabase(b, 'ADMINISTRATOR', 'IPLFB');
    for (const [own, other, company] of [[a, b, 'IPL'], [b, a, 'IPLFB']] as const) {
      await signIn(page, own);
      await page.waitForURL('**/choose-work');
      await expect(tid(page, 'choose-co').locator('option')).toHaveCount(1);
      await expect(tid(page, 'choose-co')).toHaveValue(company);
      await tid(page, 'choose-go').click();
      await page.waitForURL('**/dashboard');
      await expect(tid(page, 'layout-company')).toContainText(company);
      await tid(page, 'company-switcher').click();
      await expect(tid(page, 'company-menu').locator('[data-testid^="switch-"]')).toHaveCount(1);
      await tid(page, 'company-switcher').click();
      await page.goto('/users');
      await page.getByLabel('Search users').first().fill(own);
      await expect(tid(page, 'users-table')).toContainText(own);
      await page.getByLabel('Search users').first().fill(other);
      await expect(page.getByText('No users match your search')).toBeVisible();
      await shot(page, `TC-LGN03-007-E01_${company}`);
    }
  });

  /** @tc TC-LGN03-007-E02 @story US-LGN03-007 @ac AC-US-LGN03-007-02 @subtask ST-LGN03-007-IN-02 */
  test('WF-UF-03 TC-LGN03-007-E02 users with different roles each land on the page of the own role; a user with two companies switches from the header; a user with no company is told whom to call', async ({ page }) => {
    // Administrator in IPL, Auditor in IPLFB: company page, Opening page, dashboard, switch from the header
    const both = makeLocalUser();
    grantRoleInDatabase(both, 'ADMINISTRATOR', 'IPL');
    grantRoleInDatabase(both, 'AUDITOR', 'IPLFB');
    await signIn(page, both);
    await page.waitForURL('**/choose-work');
    await expect(tid(page, 'choose-co').locator('option')).toHaveCount(3);
    await tid(page, 'choose-co').selectOption('IPL');
    await expect(tid(page, 'choose-roles')).toContainText('Administrator');
    await tid(page, 'choose-go').click();
    await expect(tid(page, 'opening')).toContainText('Admin Dashboard');
    await page.waitForURL('**/dashboard');
    await shot(page, 'TC-LGN03-007-E02_admin');
    await tid(page, 'company-switcher').click();
    await tid(page, 'switch-IPLFB').click();
    await expect(tid(page, 'opening')).toContainText('Proposal dashboard');
    await page.waitForURL('**/landing/reports');
    await expect(tid(page, 'landing-placeholder')).toContainText('Proposal dashboard');
    await expect(tid(page, 'layout-company')).toContainText('IPLFB');

    // one role each: Finance, initiator with processor
    const finance = makeLocalUser();
    grantRoleInDatabase(finance, 'FINANCE', 'IPL');
    await signIn(page, finance);
    await page.waitForURL('**/choose-work');
    await tid(page, 'choose-go').click();
    await page.waitForURL('**/landing/finance');
    await expect(tid(page, 'landing-placeholder')).toContainText('Finance Dashboard');
    const initiator = makeLocalUser();
    grantRoleInDatabase(initiator, 'INITIATOR', 'IPL');
    grantRoleInDatabase(initiator, 'PROCESSOR', 'IPL');
    await signIn(page, initiator);
    await page.waitForURL('**/choose-work');
    await tid(page, 'choose-go').click();
    await page.waitForURL('**/landing/inbox');
    await expect(tid(page, 'landing-placeholder')).toContainText('Processor Dashboard');

    // no company: told whom to call
    const nobody = makeLocalUser();
    await signIn(page, nobody);
    await page.waitForURL('**/no-company-access');
    await expect(tid(page, 'no-access')).toContainText('No company access yet');
    await shot(page, 'TC-LGN03-007-E02_no-access');
  });
});
