/**
 * @file    no-company-access.spec.ts
 * @module  Tests (journeys)
 *
 * @description
 * Playwright journey of the no-company-access page (LGN-10). In plain words: a real user who has no company and role valid today signs in, is shown the no-access page with the IT contact, a reference, a Copy details button and Sign out, copies the details, signs out, and, once the IT team has given a role, signs in again and reaches the company page.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-004
 * @subtask        ST-LGN03-004-FE-03
 * @workflow       UF-03
 * @lld            LLD-EPIC-LGN-03 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/e2e/no-company-access.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { expect, test } from '@playwright/test';
import { PASSWORD, grantRoleInDatabase, makeLocalUser, removeMadeUsers, shot, submitPassword, tid } from './helpers/auth-journey';

test.describe('User without a company sees the no-access page (US-LGN03-004)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN03-004-E01 @story US-LGN03-004 @ac AC-US-LGN03-004-01 @subtask ST-LGN03-004-FE-03 */
  test('TC-LGN03-004-E01 a signed-in user with no company sees the IT contact, a reference, Copy details and Sign out; after a role is given the next sign-in reaches the company page', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const code = makeLocalUser();
    await page.goto('/login');
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL('**/no-company-access');
    await expect(tid(page, 'no-access')).toContainText('No company access yet');
    await expect(tid(page, 'helpdesk')).toContainText('Phone');
    await expect(tid(page, 'helpdesk')).toContainText('E-mail');
    const reference = (await tid(page, 'reference').textContent()) ?? '';
    expect(reference).toMatch(new RegExp(`^${code}-\\d{6}-\\d{4}$`));
    await shot(page, 'TC-LGN03-004-E01_no-access');

    await page.getByRole('button', { name: 'Copy my details for the IT team' }).click();
    await expect(page.getByText('Details copied')).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain(`employee code ${code}`);
    expect(copied).toContain(`reference ${reference}`);

    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL('**/login**');
    await expect(tid(page, 'employee-code')).toBeVisible();

    grantRoleInDatabase(code, 'FINANCE', 'IPL');
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL('**/choose-work');
    await expect(tid(page, 'choose-roles')).toContainText('Finance');
    await shot(page, 'TC-LGN03-004-E01_after-access');
  });
});
