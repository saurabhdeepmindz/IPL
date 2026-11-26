/**
 * @file    wf-uf-01.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN01-009 (QA engineer verifies sign-in end to end with the Administrator module). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-009
 * @subtask        ST-LGN01-009-IN-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/e2e/workflows/wf-uf-01.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { expect, test } from '@playwright/test';
import { PASSWORD, makeLocalUser, removeMadeUsers, shot, submitPassword, tid } from '../helpers/auth-journey';

test.describe('Workflow UF-01: sign in (steps 1 to 3)', () => {
  test.afterAll(() => removeMadeUsers());

  /** @tc WF-UF-01 @workflow UF-01 (steps 1, 2 and 3; the company, year and landing steps belong to EPIC-LGN-03) @story US-LGN01-009 @subtask ST-LGN01-009-IN-02 */
  test('WF-UF-01 a visitor opens a protected page, is sent to sign-in, fails once, signs in and reaches the next step', async ({ page }) => {
    const code = makeLocalUser();
    await page.goto('/roles');
    await expect(page).toHaveURL(/\/login\?next=%2Froles/);
    await shot(page, 'WF-UF-01_1-sent-to-sign-in');
    await submitPassword(page, code, 'wrong-first');
    await expect(tid(page, 'sign-in-error')).toContainText('attempts left');
    await shot(page, 'WF-UF-01_2-wrong-password');
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL(/\/choose-work\?next=%2Froles/);
    await shot(page, 'WF-UF-01_3-signed-in');
  });
});
