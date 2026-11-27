/**
 * @file    choose-password.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN02-008 (User changes a temporary password at first sign-in). In plain words: a user whose password is temporary signs in on the real sign-in page, lands on the change page, and saves a new password.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-008
 * @subtask        ST-LGN02-008-FE-03
 * @lld            LLD-EPIC-LGN-02 v0.2 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/e2e/choose-password.spec.ts
 * @lld-synced     v0.2
 * @status         built
 */

import { expect, test, type Page } from '@playwright/test';
import {
  PASSWORD,
  makeLocalUser,
  removeMadeUsers,
  shot,
  submitPassword,
  tid,
} from './helpers/auth-journey';

const NEW_PASSWORD = 'Fresh#Pass2026';
const ADMIN_API = process.env.E2E_API_URL ?? 'http://localhost:3100/api/v1';

/** Signs in on /login as a user whose password is temporary (the temporary password is PASSWORD) and waits for the change page. */
async function signInWithTemporaryPassword(page: Page, code: string): Promise<string> {
  await page.goto('/login');
  const answer = page.waitForResponse(
    (r) => r.url().includes('/auth/sign-in') && r.request().method() === 'POST',
  );
  await submitPassword(page, code, PASSWORD);
  const body = (await (await answer).json()) as { data: { accessToken: string; nextStep: string } };
  expect(body.data.nextStep).toBe('CHANGE_PASSWORD');
  await page.waitForURL('**/choose-password');
  return body.data.accessToken;
}

async function fillChange(page: Page, temporary: string, next: string): Promise<void> {
  await tid(page, 'choose-temp').fill(temporary);
  await tid(page, 'choose-new').fill(next);
  await tid(page, 'choose-confirm').fill(next);
}

test.describe('User changes a temporary password at first sign-in (US-LGN02-008)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN02-008-E01 @story US-LGN02-008 @ac AC-US-LGN02-008-01 @subtask ST-LGN02-008-FE-03 */
  test('TC-LGN02-008-E01 signing in with a temporary password shows this page, the user may sign out, and no other call is allowed until the password is changed', async ({
    page,
  }) => {
    const code = makeLocalUser('ACTIVE', true);
    const token = await signInWithTemporaryPassword(page, code);
    await expect(tid(page, 'choose-page')).toContainText('Choose your own password');
    await expect(tid(page, 'choose-chip')).toContainText(code);
    await expect(tid(page, 'choose-sign-out')).toBeVisible();
    const other = await fetch(`${ADMIN_API}/users`, {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(other.status).toBe(403);
    expect(((await other.json()) as { error: { code: string } }).error.code).toBe(
      'MUST_CHANGE_PASSWORD',
    );
    await shot(page, 'TC-LGN02-008-E01_choose-your-own-password');
  });

  /** @tc TC-LGN02-008-E02 @story US-LGN02-008 @ac AC-US-LGN02-008-02 @subtask ST-LGN02-008-FE-03 */
  test('TC-LGN02-008-E02 valid entries save the password and go on to company and year; the new password then signs in without the change page', async ({
    page,
  }) => {
    const code = makeLocalUser('ACTIVE', true);
    await signInWithTemporaryPassword(page, code);
    await fillChange(page, PASSWORD, NEW_PASSWORD);
    await expect(tid(page, 'strength-bar')).toHaveAttribute('data-met', '5');
    await tid(page, 'choose-submit').click();
    await page.waitForURL('**/choose-work**');
    await shot(page, 'TC-LGN02-008-E02_saved');
    // the session cookie would send /login straight on, so start again as a new visitor
    await page.context().clearCookies();
    await page.goto('/login');
    await submitPassword(page, code, NEW_PASSWORD);
    await page.waitForURL('**/choose-work**');
  });

  /** @tc TC-LGN02-008-E03 @story US-LGN02-008 @ac AC-US-LGN02-008-03 @subtask ST-LGN02-008-FE-03 */
  test('TC-LGN02-008-E03 a wrong temporary password shows a plain error and keeps the form', async ({
    page,
  }) => {
    const code = makeLocalUser('ACTIVE', true);
    await signInWithTemporaryPassword(page, code);
    await fillChange(page, 'Not-the-temporary-1', NEW_PASSWORD);
    await tid(page, 'choose-submit').click();
    await expect(tid(page, 'choose-error')).toContainText('not the temporary password');
    await expect(tid(page, 'choose-new')).toHaveValue(NEW_PASSWORD);
    expect(page.url()).toContain('/choose-password');
    await shot(page, 'TC-LGN02-008-E03_wrong-temporary');
  });
});
