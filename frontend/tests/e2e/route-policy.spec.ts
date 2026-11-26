/**
 * @file    route-policy.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN01-008 (Application sends visitors without a session to sign-in). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-008
 * @subtask        ST-LGN01-008-FE-03
 * @lld            LLD-EPIC-LGN-01 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/e2e/route-policy.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { expect, test } from '@playwright/test';
import { PASSWORD, makeLocalUser, removeMadeUsers, shot, submitPassword } from './helpers/auth-journey';

test.describe('Application sends visitors without a session to sign-in (US-LGN01-008)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN01-008-E01 @story US-LGN01-008 @ac AC-US-LGN01-008-01 @subtask ST-LGN01-008-FE-03 */
  test('TC-LGN01-008-E01 a protected page with no session goes to sign-in and, after sign-in, on with the page asked for', async ({ page }) => {
    const code = makeLocalUser();
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login\?next=%2Fusers/);
    await shot(page, 'TC-LGN01-008-E01_redirected');
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL(/\/choose-work\?next=%2Fusers/);
    await shot(page, 'TC-LGN01-008-E01_after-sign-in');
  });

  /** @tc TC-LGN01-008-E02 @story US-LGN01-008 @ac AC-US-LGN01-008-02 @subtask ST-LGN01-008-FE-03 */
  test('TC-LGN01-008-E02 a signed-in user who opens the sign-in page is sent on', async ({ page }) => {
    const code = makeLocalUser();
    await page.goto('/login');
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL('**/choose-work**');
    await page.goto('/login');
    await expect(page).toHaveURL(/\/choose-work/);
    await shot(page, 'TC-LGN01-008-E02_sent-on');
  });
});
