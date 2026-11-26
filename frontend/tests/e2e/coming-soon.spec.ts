/**
 * @file    coming-soon.spec.ts
 * @module  Tests
 *
 * @description
 * Journeys of the Coming soon pages. In plain words: the bell and a menu item of a later release open the placeholder, and the button leads back.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-017
 * @subtask        ST-ADM01-017-FE-01
 * @status         built
 */

import { expect, test, type Page } from '@playwright/test';

async function signIn(page: Page) {
  await page.goto('/login?dev=1');
  await page.getByLabel(/Employee code/).filter({ visible: true }).fill('10001');
  await page.getByLabel(/Company/).filter({ visible: true }).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
}

test.describe('Coming soon pages (decision UX-ACC-02, Administration frame)', () => {
  /** @tc TC-ADM01-017-E20 @story US-ADM01-017 @subtask ST-ADM01-017-FE-01 */
  test('the notification bell opens the Coming soon page with a way back', async ({ page }) => {
    await signIn(page);
    await page.getByRole('link', { name: /Notifications/ }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/coming-soon\?feature=Notifications/);
    const soon = () => page.getByTestId('coming-soon').filter({ visible: true });
    await expect(soon()).toContainText('Coming soon');
    await page.getByTestId('coming-soon-back').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(soon()).toContainText('Admin Dashboard');
    await page.getByTestId('coming-soon-back').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/users/);
  });

  /** @tc TC-ADM01-017-E21 @story US-ADM01-017 @subtask ST-ADM01-017-FE-01 */
  test('a menu item of a later release opens the Coming soon page', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Workflow Management' }).filter({ visible: true }).click();
    await page.getByRole('link', { name: 'Workflow Monitor' }).filter({ visible: true }).click();
    await expect(page.getByTestId('coming-soon').filter({ visible: true })).toContainText('Workflow Monitor');
  });
});
