/**
 * @file    choose-work.spec.ts
 * @module  Tests (journeys)
 *
 * @description
 * Playwright journey of the company and financial year page (LGN-09). In plain words: real users sign in through the Auth API in the browser and reach /choose-work; the page lists their companies with the roles, selects the current financial year, and Continue saves the choice and opens the landing page of the role.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-003
 * @subtask        ST-LGN03-003-FE-03
 * @workflow       UF-03
 * @lld            LLD-EPIC-LGN-03 v0.3 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/e2e/choose-work.spec.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { expect, test, type Page } from '@playwright/test';
import { PASSWORD, grantRoleInDatabase, makeLocalUser, removeMadeUsers, shot, submitPassword, tid } from './helpers/auth-journey';

/** The label of the current financial year (April to March, by the Indian date). */
function currentYear(): string {
  const india = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const start = india.getUTCMonth() >= 3 ? india.getUTCFullYear() : india.getUTCFullYear() - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

/** Signs in on /login with the known password and waits for the company page. */
async function signInToCompanyPage(page: Page, code: string): Promise<void> {
  await page.goto('/login');
  await submitPassword(page, code, PASSWORD);
  await page.waitForURL('**/choose-work');
  await tid(page, 'choose-company').waitFor();
}

test.describe('User chooses company and financial year (US-LGN03-003)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN03-003-E01 @story US-LGN03-003 @ac AC-US-LGN03-003-01 @subtask ST-LGN03-003-FE-03 */
  test('TC-LGN03-003-E01 several companies are listed with the roles as a single choice; one company is preselected', async ({ page }) => {
    const two = makeLocalUser();
    grantRoleInDatabase(two, 'ADMINISTRATOR', 'IPL');
    grantRoleInDatabase(two, 'INITIATOR', 'IPLFB');
    grantRoleInDatabase(two, 'PROCESSOR', 'IPLFB');
    await signInToCompanyPage(page, two);
    const select = tid(page, 'choose-co');
    await expect(select.locator('option')).toHaveText(['Select a company', /· IPL$/, /· IPLFB$/]);
    await expect(select).toHaveValue('');
    await expect(tid(page, 'choose-roles')).toHaveCount(0);
    await select.selectOption('IPLFB');
    await expect(tid(page, 'choose-roles')).toContainText('Initiator, Processor');
    await shot(page, 'TC-LGN03-003-E01_two-companies');

    const one = makeLocalUser();
    grantRoleInDatabase(one, 'FINANCE', 'IPL');
    await page.context().clearCookies();
    await signInToCompanyPage(page, one);
    await expect(tid(page, 'choose-co')).toHaveValue('IPL');
    await expect(tid(page, 'choose-co').locator('option')).toHaveCount(1);
    await expect(tid(page, 'choose-roles')).toContainText('Finance');
    await shot(page, 'TC-LGN03-003-E01_one-company');
  });

  /** @tc TC-LGN03-003-E02 @story US-LGN03-003 @ac AC-US-LGN03-003-02 @subtask ST-LGN03-003-FE-03 */
  test('TC-LGN03-003-E02 the current financial year is selected and can be changed', async ({ page }) => {
    const code = makeLocalUser();
    grantRoleInDatabase(code, 'FINANCE', 'IPL');
    await signInToCompanyPage(page, code);
    const year = tid(page, 'choose-fy');
    await expect(year).toHaveValue(currentYear());
    await expect(year.locator('option').first()).toContainText('(current)');
    await expect(year.locator('option')).toHaveCount(3);
    const earlier = await year.locator('option').nth(1).getAttribute('value');
    await year.selectOption(earlier ?? '');
    await expect(year).toHaveValue(earlier ?? '');
    await shot(page, 'TC-LGN03-003-E02_year');
  });

  /** @tc TC-LGN03-003-E03 @story US-LGN03-003 @ac AC-US-LGN03-003-03 @subtask ST-LGN03-003-FE-03 */
  test('TC-LGN03-003-E03 Continue saves the choice with API-ME-02 and opens the landing page of the role', async ({ page }) => {
    const code = makeLocalUser();
    grantRoleInDatabase(code, 'ADMINISTRATOR', 'IPL');
    await signInToCompanyPage(page, code);
    const saved = page.waitForResponse((r) => r.url().includes('/me/context') && r.request().method() === 'PUT');
    await tid(page, 'choose-go').click();
    const answer = await saved;
    expect(answer.status()).toBe(200);
    const body = (await answer.json()) as { data: { context: { companyCode: string; financialYear: string }; landing: { role: string; route: string } } };
    expect(body.data.context).toEqual({ companyCode: 'IPL', financialYear: currentYear() });
    expect(body.data.landing).toEqual({ role: 'ADMINISTRATOR', route: '/dashboard' });
    await page.waitForURL('**/dashboard');
    await shot(page, 'TC-LGN03-003-E03_landing');
  });
});
