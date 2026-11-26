/**
 * @file    sso-states.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN01-007 (User sees what happened when single sign-on does not work). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-007
 * @subtask        ST-LGN01-007-FE-03
 * @lld            LLD-EPIC-LGN-01 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/e2e/sso-states.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { expect, test } from '@playwright/test';
import { removeMadeUsers, shot, stubCallback, tid } from './helpers/auth-journey';

test.describe('User sees what happened when single sign-on does not work (US-LGN01-007)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN01-007-E01 @story US-LGN01-007 @ac AC-US-LGN01-007-01 @subtask ST-LGN01-007-FE-03 */
  test('TC-LGN01-007-E01 a provider that does not answer shows Try again, the AMS password, the IT contact and a reference', async ({ page, request }) => {
    await stubCallback(page, request, 'fail');
    await expect(page).toHaveURL(/\/signing-in\?state=failed&ref=FAI-\d{4}-[A-Z0-9]{4}/);
    await expect(tid(page, 'sso-status')).toContainText(/did not work/i);
    await expect(tid(page, 'sso-try-again')).toBeVisible();
    await expect(tid(page, 'sso-password-instead')).toBeVisible();
    await expect(tid(page, 'helpdesk')).toBeVisible();
    await expect(tid(page, 'reference')).toContainText(/FAI-/);
    await shot(page, 'TC-LGN01-007-E01_failed');
  });

  /** @tc TC-LGN01-007-E02 @story US-LGN01-007 @ac AC-US-LGN01-007-02 @subtask ST-LGN01-007-FE-03 */
  test('TC-LGN01-007-E02 a person with no AMS user is told so and can Close; the contact and reference are shown', async ({ page, request }) => {
    await stubCallback(page, request, 'noaccount');
    await expect(tid(page, 'sso-status')).toContainText(/not set up/i);
    await expect(tid(page, 'sso-close')).toBeVisible();
    await expect(tid(page, 'sso-try-again')).toHaveCount(0);
    await expect(tid(page, 'reference')).toContainText(/NOA-/);
    await shot(page, 'TC-LGN01-007-E02_noaccount');
  });

  /** @tc TC-LGN01-007-E03 @story US-LGN01-007 @ac AC-US-LGN01-007-03 @subtask ST-LGN01-007-FE-03 */
  test('TC-LGN01-007-E03 a user who stops at the provider sees the cancelled state with Try again', async ({ page, request }) => {
    await stubCallback(page, request, 'cancel');
    await expect(tid(page, 'sso-status')).toContainText(/cancelled/i);
    await expect(tid(page, 'sso-try-again')).toBeVisible();
    await shot(page, 'TC-LGN01-007-E03_cancelled');
  });

  /** @tc TC-LGN01-007-E04 @story US-LGN01-007 @ac AC-US-LGN01-007-04 @subtask ST-LGN01-007-FE-03 */
  test('TC-LGN01-007-E04 while the answer has not come, a waiting state with a way back is shown', async ({ page }) => {
    await page.goto('/signing-in');
    await expect(tid(page, 'sso-status')).toContainText(/signing you in/i);
    await page.getByRole('link', { name: /cancel and go back/i }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/login/);
    await shot(page, 'TC-LGN01-007-E04_waiting');
  });
});
