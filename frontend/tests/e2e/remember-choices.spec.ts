/**
 * @file    remember-choices.spec.ts
 * @module  Tests (journeys)
 *
 * @description
 * Playwright journey of the remembered choices. In plain words: real users sign in twice on the same device. With "Start with this company and year next time" ticked the second sign-in skips the company page and opens the landing page of the remembered company and year; unticked, or when the company is no longer allowed, the page opens as usual and nothing is preselected. With "Remember my employee code on this device" ticked the sign-in page fills the code (never the password) the next time.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-006
 * @subtask        ST-LGN03-006-FE-03
 * @workflow       UF-03
 * @lld            LLD-EPIC-LGN-03 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/e2e/remember-choices.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { execSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';
import { DB, PASSWORD, grantRoleInDatabase, makeLocalUser, removeMadeUsers, shot, submitPassword, tid } from './helpers/auth-journey';

/** Ends the session in the browser but keeps what the device remembers (local storage). */
async function leave(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => sessionStorage.clear());
}

/** Signs in on /login with the known password. */
async function signIn(page: Page, code: string): Promise<void> {
  await page.goto('/login');
  await submitPassword(page, code, PASSWORD);
}

test.describe('Browser remembers the employee code and the last company and year (US-LGN03-006)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN03-006-E01 @story US-LGN03-006 @ac AC-US-LGN03-006-01 @subtask ST-LGN03-006-FE-03 */
  test('TC-LGN03-006-E01 with the box ticked the next sign-in skips the company page; unticked, or no longer allowed, the page opens as usual', async ({ page }) => {
    const code = makeLocalUser();
    grantRoleInDatabase(code, 'ADMINISTRATOR', 'IPL');
    grantRoleInDatabase(code, 'AUDITOR', 'IPLFB');

    // first sign-in: choose IPLFB and an earlier year, box ticked (it starts ticked)
    await signIn(page, code);
    await page.waitForURL('**/choose-work');
    await tid(page, 'choose-co').selectOption('IPLFB');
    const earlier = await tid(page, 'choose-fy').locator('option').nth(1).getAttribute('value');
    await tid(page, 'choose-fy').selectOption(earlier ?? '');
    await expect(tid(page, 'choose-rem')).toBeChecked();
    await tid(page, 'choose-go').click();
    await page.waitForURL('**/landing/reports');

    // second sign-in: the page is skipped and the remembered choice is saved at once
    await leave(page);
    const saved = page.waitForResponse((r) => r.url().includes('/me/context') && r.request().method() === 'PUT');
    await signIn(page, code);
    expect(((await (await saved).request().postDataJSON()) as { companyCode: string; financialYear: string })).toEqual({ companyCode: 'IPLFB', financialYear: earlier });
    await page.waitForURL('**/landing/reports');
    await expect(tid(page, 'choose-company')).toHaveCount(0);
    await shot(page, 'TC-LGN03-006-E01_skipped');

    // the company is no longer allowed: the page opens as usual and the choice is forgotten
    execSync(`${DB} "update user_company_roles set valid_to = current_date - 1 where company_code = 'IPLFB' and user_id = (select id from users where employee_code = '${code}')"`);
    await leave(page);
    await signIn(page, code);
    await page.waitForURL('**/choose-work');
    await expect(tid(page, 'choose-company')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('ams.context'))).toBeNull();

    // the box unticked: the choice is not remembered, and the next sign-in shows the page with nothing chosen
    const other = makeLocalUser();
    grantRoleInDatabase(other, 'ADMINISTRATOR', 'IPL');
    grantRoleInDatabase(other, 'AUDITOR', 'IPLFB');
    await leave(page);
    await signIn(page, other);
    await page.waitForURL('**/choose-work');
    await tid(page, 'choose-co').selectOption('IPL');
    await tid(page, 'choose-rem').uncheck();
    await tid(page, 'choose-go').click();
    await page.waitForURL('**/dashboard');
    await leave(page);
    await signIn(page, other);
    await page.waitForURL('**/choose-work');
    await expect(tid(page, 'choose-co')).toHaveValue('');
  });

  /** @tc TC-LGN03-006-E02 @story US-LGN03-006 @ac AC-US-LGN03-006-02 @subtask ST-LGN03-006-FE-03 */
  test('TC-LGN03-006-E02 with the box ticked the sign-in page fills the employee code the next time, and never the password', async ({ page }) => {
    const code = makeLocalUser();
    grantRoleInDatabase(code, 'FINANCE', 'IPL');
    await page.goto('/login');
    await tid(page, 'remember').check();
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL('**/choose-work');
    await leave(page);
    await page.goto('/login');
    await expect(tid(page, 'employee-code')).toHaveValue(code);
    await expect(tid(page, 'password')).toHaveValue('');
    await expect(tid(page, 'remember')).toBeChecked();
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(PASSWORD);
    await shot(page, 'TC-LGN03-006-E02_filled-code');

    await tid(page, 'remember').uncheck();
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL('**/choose-work');
    await leave(page);
    await page.goto('/login');
    await expect(tid(page, 'employee-code')).toHaveValue('');
  });
});
