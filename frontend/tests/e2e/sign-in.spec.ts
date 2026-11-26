/**
 * @file    sign-in.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN01-005 (User signs in on the sign-in page). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-03
 * @lld            LLD-EPIC-LGN-01 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/e2e/sign-in.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { expect, test } from '@playwright/test';
import { PASSWORD, makeLocalUser, removeMadeUsers, shot, submitPassword, tid } from './helpers/auth-journey';

test.describe('User signs in on the sign-in page (US-LGN01-005)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN01-005-E01 @story US-LGN01-005 @ac AC-US-LGN01-005-01 @subtask ST-LGN01-005-FE-03 */
  test('TC-LGN01-005-E01 the single sign-on button goes through the stub provider and the user moves on with a session', async ({ page, context }) => {
    await page.goto('/login');
    await expect(tid(page, 'sign-in-page')).toBeVisible();
    await shot(page, 'TC-LGN01-005-E01_1-login');
    await tid(page, 'sso-button').click();
    await page.waitForURL('**/choose-work**');
    expect((await context.cookies()).some((c) => c.name === 'ams_session')).toBe(true);
    await shot(page, 'TC-LGN01-005-E01_2-after-sso');
  });

  /** @tc TC-LGN01-005-E02 @story US-LGN01-005 @ac AC-US-LGN01-005-02 @subtask ST-LGN01-005-FE-03 */
  test('TC-LGN01-005-E02 the password form signs in and moves on; the password can be shown', async ({ page, context }) => {
    const code = makeLocalUser();
    await page.goto('/login');
    await tid(page, 'password').fill(PASSWORD);
    await expect(tid(page, 'password')).toHaveAttribute('type', 'password');
    await tid(page, 'show-password').check();
    await expect(tid(page, 'password')).toHaveAttribute('type', 'text');
    await shot(page, 'TC-LGN01-005-E02_1-filled');
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL('**/choose-work**');
    expect((await context.cookies()).some((c) => c.name === 'ams_session')).toBe(true);
    await shot(page, 'TC-LGN01-005-E02_2-signed-in');
  });

  /** @tc TC-LGN01-005-E03 @story US-LGN01-005 @ac AC-US-LGN01-005-03 @subtask ST-LGN01-005-FE-03 */
  test('TC-LGN01-005-E03 the "test sign-in" banner shows while the stub identity provider is on', async ({ page }) => {
    await page.goto('/login');
    await expect(tid(page, 'test-banner')).toContainText(/test sign-in/i);
    await shot(page, 'TC-LGN01-005-E03_banner');
  });
});
