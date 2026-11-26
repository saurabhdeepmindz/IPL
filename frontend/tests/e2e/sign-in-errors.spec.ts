/**
 * @file    sign-in-errors.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN01-006 (User sees why a password sign-in failed). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-006
 * @subtask        ST-LGN01-006-FE-03
 * @lld            LLD-EPIC-LGN-01 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/e2e/sign-in-errors.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { expect, test } from '@playwright/test';
import { PASSWORD, makeLocalUser, removeMadeUsers, shot, submitPassword, tid, unlockInDatabase } from './helpers/auth-journey';

test.describe('User sees why a password sign-in failed (US-LGN01-006)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN01-006-E01 @story US-LGN01-006 @ac AC-US-LGN01-006-01 @subtask ST-LGN01-006-FE-03 */
  test('TC-LGN01-006-E01 a wrong password shows one message with the attempts left; the code stays, the password is cleared', async ({ page }) => {
    const code = makeLocalUser();
    await page.goto('/login');
    await submitPassword(page, code, 'not-the-password');
    await expect(tid(page, 'sign-in-error')).toContainText('Employee code or password is not right');
    await expect(tid(page, 'sign-in-error')).toContainText('4 attempts left');
    await expect(tid(page, 'employee-code')).toHaveValue(code);
    await expect(tid(page, 'password')).toHaveValue('');
    await shot(page, 'TC-LGN01-006-E01_wrong-password');
  });

  /** @tc TC-LGN01-006-E02 @story US-LGN01-006 @ac AC-US-LGN01-006-02 @subtask ST-LGN01-006-FE-03 */
  test('TC-LGN01-006-E02 the fifth wrong password shows the locked message with the time and the IT team', async ({ page }) => {
    const code = makeLocalUser();
    await page.goto('/login');
    for (let i = 0; i < 5; i++) await submitPassword(page, code, `wrong-${i}`);
    const panel = tid(page, 'sign-in-error');
    await expect(panel).toContainText(/locked for 15 minutes/i);
    await expect(panel).toContainText(/IT team can unlock it sooner/i);
    await expect(panel).toContainText(/LCK-\d{4}-[A-Z0-9]{4}/);
    await shot(page, 'TC-LGN01-006-E02_locked');
  });

  /** @tc TC-LGN01-006-E03 @story US-LGN01-006 @ac AC-US-LGN01-006-03 @subtask ST-LGN01-006-FE-03 */
  test('TC-LGN01-006-E03 once the lock time has passed the form works and no old message is shown', async ({ page }) => {
    const code = makeLocalUser();
    await page.goto('/login');
    for (let i = 0; i < 5; i++) await submitPassword(page, code, `wrong-${i}`);
    await expect(tid(page, 'sign-in-error')).toContainText(/locked/i);
    unlockInDatabase(code);
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL('**/choose-work**');
    await shot(page, 'TC-LGN01-006-E03_signed-in-after-lock');
  });

  /** @tc TC-LGN01-006-E04 @story US-LGN01-006 @ac AC-US-LGN01-006-04 @subtask ST-LGN01-006-FE-03 */
  test('TC-LGN01-006-E04 an inactive account shows the IT contact and the reference', async ({ page }) => {
    const code = makeLocalUser('INACTIVE');
    await page.goto('/login');
    await submitPassword(page, code, PASSWORD);
    await expect(tid(page, 'sign-in-error')).toContainText(/not active/i);
    await expect(tid(page, 'sign-in-error')).toContainText(/INA-\d{4}-[A-Z0-9]{4}/);
    await expect(tid(page, 'helpdesk')).toContainText('IT helpdesk');
    await shot(page, 'TC-LGN01-006-E04_inactive');
  });
});
