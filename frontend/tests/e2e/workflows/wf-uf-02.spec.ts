/**
 * @file    wf-uf-02.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN02-009 (QA engineer verifies the reset and temporary-password flows end to end). In plain words: workflow UF-02 is walked in a real browser: Forgot password from the sign-in page, the real mail in the trap, the link, the new password, and the temporary-password change.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-009
 * @subtask        ST-LGN02-009-IN-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/e2e/workflows/wf-uf-02.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { expect, test, type Page } from '@playwright/test';
import {
  PASSWORD,
  countMails,
  makeLocalUser,
  removeMadeUsers,
  shot,
  submitPassword,
  tid,
  waitForResetToken,
} from '../helpers/auth-journey';

const NEW_PASSWORD = 'Fresh#Pass2026';

/** Walks UF-02 steps 1 to 4 in the browser: sign-in page, Forgot password, the form, the check-your-e-mail page. Returns the address the mail goes to. */
async function askForTheLink(page: Page, code: string): Promise<string> {
  const email = `j${code}@example.invalid`;
  await page.goto('/login');
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await page.waitForURL('**/forgot-password');
  await tid(page, 'forgot-code').fill(code);
  await tid(page, 'forgot-email').fill(email);
  await tid(page, 'forgot-submit').click();
  await expect(tid(page, 'forgot-sent')).toBeVisible();
  return email;
}

/** @tc WF-UF-02 @workflow UF-02 (Forgot password, the e-mail, the link, the new password, and the temporary-password change) @story US-LGN02-009 @subtask ST-LGN02-009-IN-02 */
test.describe('Workflow UF-02: reset a password and change a temporary password', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN02-009-E01 @story US-LGN02-009 @ac AC-US-LGN02-009-01 @subtask ST-LGN02-009-IN-02 */
  test('TC-LGN02-009-E01 a user asks for a reset link from the sign-in page and the mail trap holds one e-mail with a link', async ({
    page,
  }) => {
    const code = makeLocalUser();
    const email = await askForTheLink(page, code);
    await expect(tid(page, 'forgot-masked')).toHaveText(`j${code[0]}***@example.invalid`);
    const token = await waitForResetToken(email);
    expect(token.length).toBeGreaterThan(20);
    expect(await countMails(email)).toBe(1);
    await shot(page, 'TC-LGN02-009-E01_check-your-email');
  });

  /** @tc TC-LGN02-009-E02 @story US-LGN02-009 @ac AC-US-LGN02-009-02 @subtask ST-LGN02-009-IN-02 */
  test('TC-LGN02-009-E02 the link from the e-mail sets a new password that works, and the link cannot be used again', async ({
    page,
  }) => {
    const code = makeLocalUser();
    const email = await askForTheLink(page, code);
    const token = await waitForResetToken(email);
    await page.goto(`/set-password?token=${token}`);
    await tid(page, 'set-new').fill(NEW_PASSWORD);
    await tid(page, 'set-confirm').fill(NEW_PASSWORD);
    await tid(page, 'set-submit').click();
    await expect(tid(page, 'password-changed')).toBeVisible();
    await shot(page, 'TC-LGN02-009-E02_changed');
    await tid(page, 'password-changed-sign-in').click();
    await page.waitForURL('**/login?reason=reset');
    await submitPassword(page, code, PASSWORD);
    await expect(tid(page, 'sign-in-error')).toContainText('not correct');
    await submitPassword(page, code, NEW_PASSWORD);
    await page.waitForURL('**/choose-work**');
    await page.context().clearCookies();
    await page.goto(`/set-password?token=${token}`);
    await expect(tid(page, 'link-expired')).toBeVisible();
    await shot(page, 'TC-LGN02-009-E02_link-used');
  });

  /** @tc TC-LGN02-009-E03 @story US-LGN02-009 @ac AC-US-LGN02-009-03 @subtask ST-LGN02-009-IN-02 */
  test('TC-LGN02-009-E03 a user with a temporary password signs in, changes it and reaches company and year', async ({
    page,
  }) => {
    const code = makeLocalUser('ACTIVE', true);
    await page.goto('/login');
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL('**/choose-password');
    await expect(tid(page, 'choose-page')).toBeVisible();
    await tid(page, 'choose-temp').fill(PASSWORD);
    await tid(page, 'choose-new').fill(NEW_PASSWORD);
    await tid(page, 'choose-confirm').fill(NEW_PASSWORD);
    await tid(page, 'choose-submit').click();
    await page.waitForURL('**/choose-work**');
    await shot(page, 'TC-LGN02-009-E03_company-and-year');
  });
});
