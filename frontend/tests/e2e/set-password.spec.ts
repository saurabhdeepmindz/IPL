/**
 * @file    set-password.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN02-007 (User sets a new password from the link). In plain words: the set-password page is driven in a real browser with a real reset link taken from the mail trap.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-007
 * @subtask        ST-LGN02-007-FE-03
 * @lld            LLD-EPIC-LGN-02 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/e2e/set-password.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { expect, test } from '@playwright/test';
import {
  insertResetToken,
  makeLocalUser,
  removeMadeUsers,
  requestResetLink,
  shot,
  submitPassword,
  tid,
} from './helpers/auth-journey';

const NEW_PASSWORD = 'Fresh#Pass2026';

test.describe('User sets a new password from the link (US-LGN02-007)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc TC-LGN02-007-E01 @story US-LGN02-007 @ac AC-US-LGN02-007-01 @subtask ST-LGN02-007-FE-03 */
  test('TC-LGN02-007-E01 the rules show as met or not while typing and Save stays off until all are met and both fields are equal', async ({
    page,
  }) => {
    const token = await requestResetLink(makeLocalUser());
    await page.goto(`/set-password?token=${token}`);
    await tid(page, 'set-new').fill('abc');
    await expect(tid(page, 'rule-lower')).toHaveAttribute('data-met', 'true');
    await expect(tid(page, 'rule-upper')).toHaveAttribute('data-met', 'false');
    await expect(tid(page, 'set-submit')).toBeDisabled();
    await shot(page, 'TC-LGN02-007-E01_rules-partly-met');
    await tid(page, 'set-new').fill(NEW_PASSWORD);
    await tid(page, 'set-confirm').fill('Fresh#Pass2027');
    await expect(tid(page, 'set-submit')).toBeDisabled();
    await expect(tid(page, 'set-error-confirm')).toContainText('do not match');
    await tid(page, 'set-confirm').fill(NEW_PASSWORD);
    await expect(tid(page, 'strength-bar')).toHaveAttribute('data-met', '5');
    await expect(tid(page, 'set-submit')).toBeEnabled();
    await shot(page, 'TC-LGN02-007-E01_all-met');
  });

  /** @tc TC-LGN02-007-E02 @story US-LGN02-007 @ac AC-US-LGN02-007-02 @subtask ST-LGN02-007-FE-03 */
  test('TC-LGN02-007-E02 a password used before shows a plain message and the form is kept', async ({
    page,
  }) => {
    const code = makeLocalUser();
    await page.goto(`/set-password?token=${await requestResetLink(code)}`);
    await tid(page, 'set-new').fill(NEW_PASSWORD);
    await tid(page, 'set-confirm').fill(NEW_PASSWORD);
    await tid(page, 'set-submit').click();
    await expect(tid(page, 'password-changed')).toBeVisible();
    // a second link (put in the database: the 60-second rule allows no second e-mail), and the same password again: it is now in the history
    await page.goto(`/set-password?token=${insertResetToken(code)}`);
    await tid(page, 'set-new').fill(NEW_PASSWORD);
    await tid(page, 'set-confirm').fill(NEW_PASSWORD);
    await tid(page, 'set-submit').click();
    await expect(tid(page, 'set-error')).toContainText('not used before');
    await expect(tid(page, 'set-new')).toHaveValue(NEW_PASSWORD);
    await expect(tid(page, 'password-changed')).toHaveCount(0);
    await shot(page, 'TC-LGN02-007-E02_reused');
  });

  /** @tc TC-LGN02-007-E03 @story US-LGN02-007 @ac AC-US-LGN02-007-03 @subtask ST-LGN02-007-FE-03 */
  test('TC-LGN02-007-E03 a used or unknown link shows "This link has expired" with a button to ask for a new link', async ({
    page,
  }) => {
    await page.goto('/set-password?token=this-link-never-existed');
    await expect(tid(page, 'link-expired')).toContainText('This link has expired');
    await shot(page, 'TC-LGN02-007-E03_expired');
    await tid(page, 'ask-new-link').click();
    await page.waitForURL('**/forgot-password');
  });

  /** @tc TC-LGN02-007-E04 @story US-LGN02-007 @ac AC-US-LGN02-007-04 @subtask ST-LGN02-007-FE-03 */
  test('TC-LGN02-007-E04 a valid link and password show the changed page, sign-in works with the new password, and the link works once', async ({
    page,
  }) => {
    const code = makeLocalUser();
    const token = await requestResetLink(code);
    await page.goto(`/set-password?token=${token}`);
    await tid(page, 'set-new').fill(NEW_PASSWORD);
    await tid(page, 'set-confirm').fill(NEW_PASSWORD);
    await tid(page, 'set-submit').click();
    await expect(tid(page, 'password-changed')).toBeVisible();
    await shot(page, 'TC-LGN02-007-E04_changed');
    await tid(page, 'password-changed-sign-in').click();
    await page.waitForURL('**/login?reason=reset');
    await submitPassword(page, code, NEW_PASSWORD);
    await page.waitForURL('**/choose-work**');
    await page.goto(`/set-password?token=${token}`);
    await expect(tid(page, 'link-expired')).toBeVisible();
  });
});
