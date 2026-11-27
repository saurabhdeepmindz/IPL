/**
 * @file    forgot-password.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN02-006 (User asks for a password reset link). In plain words: the forgot-password page is driven in a real browser against the real Auth API (and a stubbed 429 for the limit case); each case saves a picture.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-006
 * @subtask        ST-LGN02-006-FE-03
 * @lld            LLD-EPIC-LGN-02 v0.2 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/e2e/forgot-password.spec.ts
 * @lld-synced     v0.2
 * @status         built
 */

import { expect, test, type Page } from '@playwright/test';
import { shot, tid } from './helpers/auth-journey';

const json = (body: unknown, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) });

async function fill(page: Page, code: string, mail: string): Promise<void> {
  await tid(page, 'forgot-code').fill(code);
  await tid(page, 'forgot-email').fill(mail);
}

test.describe('User asks for a password reset link (US-LGN02-006)', () => {
  /** @tc TC-LGN02-006-E01 @story US-LGN02-006 @ac AC-US-LGN02-006-01 @subtask ST-LGN02-006-FE-03 */
  test('TC-LGN02-006-E01 an empty code or e-mail shows what is missing and nothing is sent', async ({ page }) => {
    let sent = 0;
    await page.route('**/auth/password/forgot', (r) => { sent += 1; return r.fulfill(json({ data: {} }, 202)); });
    await page.goto('/forgot-password');
    await tid(page, 'forgot-submit').click();
    await expect(tid(page, 'forgot-error-code')).toBeVisible();
    await expect(tid(page, 'forgot-error-email')).toBeVisible();
    await tid(page, 'forgot-code').fill('10002');
    await tid(page, 'forgot-submit').click();
    await expect(tid(page, 'forgot-error-code')).toHaveCount(0);
    await expect(tid(page, 'forgot-error-email')).toBeVisible();
    expect(sent).toBe(0);
    await shot(page, 'TC-LGN02-006-E01_missing-fields');
  });

  /** @tc TC-LGN02-006-E02 @story US-LGN02-006 @ac AC-US-LGN02-006-02 @subtask ST-LGN02-006-FE-03 */
  test('TC-LGN02-006-E02 any code and e-mail give the check-your-e-mail page with a masked address', async ({ page }) => {
    await page.goto('/forgot-password');
    await fill(page, '49999', 'nobody.here@ipl.example');
    await tid(page, 'forgot-submit').click();
    await expect(tid(page, 'forgot-sent')).toBeVisible();
    await expect(tid(page, 'forgot-masked')).toHaveText('no***@ipl.example');
    await expect(tid(page, 'forgot-sent')).toContainText('30 minutes');
    await shot(page, 'TC-LGN02-006-E02_check-your-email');
  });

  /** @tc TC-LGN02-006-E03 @story US-LGN02-006 @ac AC-US-LGN02-006-03 @subtask ST-LGN02-006-FE-03 */
  test('TC-LGN02-006-E03 the resend button is off with a countdown and comes on when the wait is over', async ({ page }) => {
    await page.route('**/auth/password/forgot', (r) => r.fulfill(json({ data: { message: 'x', retryAfterSeconds: 3 } }, 202)));
    await page.goto('/forgot-password');
    await fill(page, '10002', 'k.rao@ipl.example');
    await tid(page, 'forgot-submit').click();
    await expect(tid(page, 'forgot-resend')).toBeDisabled();
    await expect(tid(page, 'forgot-countdown')).toContainText(/[1-3]/);
    await shot(page, 'TC-LGN02-006-E03_resend-off');
    await expect(tid(page, 'forgot-resend')).toBeEnabled({ timeout: 8000 });
  });

  /** @tc TC-LGN02-006-E04 @story US-LGN02-006 @ac AC-US-LGN02-006-04 @subtask ST-LGN02-006-FE-03 */
  test('TC-LGN02-006-E04 the page tells single sign-on users to reset the network password through the IT team', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(tid(page, 'forgot-sso-note')).toContainText('IPL single sign-on');
    await expect(tid(page, 'forgot-sso-note')).toContainText('through the IT team');
    await shot(page, 'TC-LGN02-006-E04_sso-note');
  });

  /** @tc TC-LGN02-006-E05 @story US-LGN02-006 @ac AC-US-LGN02-006-05 @subtask ST-LGN02-006-FE-03 */
  test('TC-LGN02-006-E05 a 429 shows a plain message with the time left and no check-your-e-mail page', async ({ page }) => {
    await page.route('**/auth/password/forgot', (r) => r.fulfill(json({ error: { code: 'RATE_LIMITED', message: 'x', fields: [], details: { retryAfterSeconds: 120 } } }, 429)));
    await page.goto('/forgot-password');
    await fill(page, '10002', 'k.rao@ipl.example');
    await tid(page, 'forgot-submit').click();
    await expect(tid(page, 'forgot-wait')).toContainText('2 minutes');
    await expect(tid(page, 'forgot-sent')).toHaveCount(0);
    await shot(page, 'TC-LGN02-006-E05_too-many');
  });
});
