/**
 * @file    users-list.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright journeys of the user list against the real built API and web application. In plain words: the list with tabs, the filters, and the load time.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/e2e/users-list.spec.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const shot = (page: Page, tc: string, step: string) => page.screenshot({ path: `${SHOTS}/TC-ADM01-002-${tc}_${step}.png`, fullPage: true });

async function signIn(page: Page) {
  await page.goto('/login?dev=1');
  await page.getByLabel(/Employee code/).fill('10001');
  await page.getByLabel(/Company/).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await expect(page.getByTestId('roles-table')).toBeVisible();
}

/** Opens User Management from the menu (client navigation, no reload). */
async function openUsers(page: Page) {
  await page.getByRole('link', { name: 'User Management' }).click();
  await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
  await expect(page.getByTestId('users-table')).toBeVisible();
}

const counts = async (request: APIRequestContext) => {
  const token = (await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } })).json()).data.accessToken as string;
  const res = await request.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` }, params: { pageSize: 100 } });
  return (await res.json()).data as { counts: { all: number; active: number; inactive: number; locked: number }; total: number };
};

test.describe('User list journeys (story 002)', () => {
  /**
   * @tc        TC-ADM01-002-E01
   * @story     US-ADM01-002
   * @ac        AC-US002-01
   * @subtask   ST-ADM01-002-FE-03
   * In plain words: journey: the list opens with the four tabs and the counts of the API, and the users with chips per company.
   */
  test('E01 shows the tabs, the counts and the users', async ({ page, request }) => {
    const api = await counts(request);
    await signIn(page);
    await openUsers(page);
    await expect(page.getByRole('tab', { name: /^All/ })).toContainText(String(api.counts.all));
    await expect(page.getByRole('tab', { name: /^Active/ })).toContainText(String(api.counts.active));
    await expect(page.getByRole('tab', { name: /^Inactive/ })).toContainText(String(api.counts.inactive));
    await expect(page.getByRole('tab', { name: /^Locked/ })).toContainText(String(api.counts.locked));
    // Test users from other journeys can fill the first page, so the Administrator is found by search.
    await page.getByLabel('Search users').filter({ visible: true }).fill('System');
    const row = page.getByRole('row', { name: /System Administrator/ });
    await expect(row).toContainText('IPL· Administrator');
    await expect(row).toContainText('Active');
    await shot(page, 'E01', 'list');
    await page.getByRole('tab', { name: /^Inactive/ }).click();
    await expect(page.getByRole('row', { name: /System Administrator/ })).toHaveCount(0);
    await shot(page, 'E01', 'inactive-tab');
  });

  /**
   * @tc        TC-ADM01-002-E02
   * @story     US-ADM01-002
   * @ac        AC-US002-02
   * @subtask   ST-ADM01-002-FE-03
   * In plain words: journey: a search word and a filter narrow the list; a word that matches nobody shows the empty message and Clear filters brings the list back.
   */
  test('E02 searches, filters and clears', async ({ page }) => {
    await signIn(page);
    await openUsers(page);
    await page.getByLabel('Search users').fill('System');
    await expect(page.getByRole('row', { name: /System Administrator/ })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Dev User' })).toHaveCount(0);
    await shot(page, 'E02', 'search');
    await page.getByLabel('Sign-in').selectOption('LOCAL');
    await page.getByLabel('Search users').fill('zzzznobody');
    await expect(page.getByText('No users match your search')).toBeVisible();
    await shot(page, 'E02', 'empty');
    await page.getByRole('button', { name: 'Clear filters' }).first().click();
    await expect(page.getByText('No users match your search')).toHaveCount(0);
    await expect(page.getByLabel('Search users').filter({ visible: true })).toHaveValue('');
    await expect(page.getByTestId('users-table').getByRole('row').nth(1)).toBeVisible();
    await shot(page, 'E02', 'cleared');
  });

  /**
   * @tc        TC-ADM01-002-E03
   * @story     US-ADM01-002
   * @ac        AC-US002-03
   * @subtask   ST-ADM01-002-FE-03
   * In plain words: journey: the list is usable within 3 seconds with the data of the test database (the 200-user case is the Vitest case J03).
   */
  test('E03 opens within 3 seconds', async ({ page }) => {
    await signIn(page);
    const started = Date.now();
    await openUsers(page);
    expect(Date.now() - started).toBeLessThan(3000);
    await shot(page, 'E03', 'opened');
  });
});
