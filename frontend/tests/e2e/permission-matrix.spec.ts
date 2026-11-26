/**
 * @file    permission-matrix.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright journeys of the permission matrix against the real built API and web application. In plain words: open, scope lists, filters, changes and Discard, locked cells; nothing is saved.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-015
 * @subtask        ST-ADM01-015-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.7
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/e2e/permission-matrix.spec.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { expect, test, type Page } from '@playwright/test';

const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const shot = (page: Page, tc: string, step: string) => page.screenshot({ path: `${SHOTS}/TC-ADM01-015-${tc}_${step}.png`, fullPage: true });

async function signIn(page: Page) {
  await page.goto('/login?dev=1');
  await page.getByLabel(/Employee code/).fill('10001');
  await page.getByLabel(/Company/).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await expect(page.getByTestId('roles-table')).toBeVisible();
}

/** Opens Permission Management from the menu and returns the milliseconds until the matrix is on the screen. */
async function openMatrix(page: Page): Promise<number> {
  const start = Date.now();
  await page.getByRole('link', { name: 'Permission Management' }).click();
  await expect(page.getByRole('heading', { name: 'Permission Management' })).toBeVisible();
  await expect(page.getByTestId('permission-matrix')).toBeVisible();
  return Date.now() - start;
}

const matrix = (page: Page) => page.getByTestId('permission-matrix');

test.describe('Permission matrix journeys (story 015)', () => {
  /**
   * @tc        TC-ADM01-015-E01
   * @story     US-ADM01-015
   * @ac        AC-US015-01
   * @subtask   ST-ADM01-015-FE-03
   * In plain words: journey: the matrix opens within 3 seconds with the roles across (with user counts) and the permissions down in module groups; every switch says On or Off in words.
   */
  test('E01 opens with roles across and groups down', async ({ page }) => {
    await signIn(page);
    const ms = await openMatrix(page);
    expect(ms).toBeLessThan(3000);
    await expect(page.getByText('Same roles in every company')).toBeVisible();
    await expect(matrix(page).getByRole('columnheader', { name: /Initiator/ })).toContainText(/\d+ users?/);
    await expect(matrix(page).getByRole('columnheader', { name: /Administrator/ })).toBeVisible();
    expect(await matrix(page).getByRole('switch').count()).toBeGreaterThan(10);
    const first = matrix(page).getByRole('switch').first();
    await expect(first.locator('xpath=ancestor::td')).toContainText(/^(On|Off)/);
    await shot(page, 'E01', 'matrix');
  });

  /**
   * @tc        TC-ADM01-015-E02
   * @story     US-ADM01-015
   * @ac        AC-US015-02
   * @subtask   ST-ADM01-015-FE-03
   * In plain words: journey: a permission with a data scope shows a list with No access, Own, Department and Company.
   */
  test('E02 shows the scope choices in words', async ({ page }) => {
    await signIn(page);
    await openMatrix(page);
    const list = matrix(page).getByRole('combobox').first();
    await expect(list).toBeVisible();
    await expect(list.getByRole('option')).toHaveText(['No access', 'Own', 'Department', 'Company']);
    await shot(page, 'E02', 'scope');
  });

  /**
   * @tc        TC-ADM01-015-E03
   * @story     US-ADM01-015
   * @ac        AC-US015-03
   * @subtask   ST-ADM01-015-FE-03
   * In plain words: journey: a search word, the module list and Show changed only narrow the rows.
   */
  test('E03 narrows the rows', async ({ page }) => {
    await signIn(page);
    await openMatrix(page);
    const rows = matrix(page).getByRole('row');
    const all = await rows.count();
    await page.getByLabel('Find a permission').fill('zzzznothing');
    await expect(page.getByTestId('matrix-empty')).toBeVisible();
    await shot(page, 'E03', 'no-match');
    await page.getByLabel('Find a permission').fill('');
    await expect(rows).toHaveCount(all);
    const modules = await page.getByLabel('Module').locator('option').allTextContents();
    await page.getByLabel('Module').selectOption({ label: modules[1] });
    const narrowed = await rows.count();
    expect(narrowed).toBeLessThan(all);
    await shot(page, 'E03', 'module');
    await page.getByLabel('Module').selectOption({ label: modules[0] });
    await matrix(page).getByRole('switch').and(page.locator(':enabled')).first().click();
    await page.getByLabel('Show changed only').check();
    await expect(matrix(page).getByRole('row')).toHaveCount(3);
    await shot(page, 'E03', 'changed-only');
  });

  /**
   * @tc        TC-ADM01-015-E04
   * @story     US-ADM01-015
   * @ac        AC-US015-04
   * @subtask   ST-ADM01-015-FE-03
   * In plain words: journey: two switches are changed; each shows a dot and the counter shows 2; Discard changes returns them. Nothing is saved.
   */
  test('E04 shows dots and the counter and Discard returns the cells', async ({ page }) => {
    await signIn(page);
    await openMatrix(page);
    const free = matrix(page).getByRole('switch').and(page.locator(':enabled'));
    const a = free.nth(0);
    const b = free.nth(1);
    const before = [await a.isChecked(), await b.isChecked()];
    await a.click();
    await b.click();
    await expect(page.getByTestId('matrix-counter')).toHaveText('2 unsaved changes');
    await expect(page.getByTestId('changed-dot')).toHaveCount(2);
    await shot(page, 'E04', 'changed');
    await page.getByRole('button', { name: 'Discard changes' }).click();
    await expect(page.getByTestId('matrix-counter')).toHaveCount(0);
    await expect(page.getByTestId('changed-dot')).toHaveCount(0);
    expect([await a.isChecked(), await b.isChecked()]).toEqual(before);
    await shot(page, 'E04', 'discarded');
  });

  /**
   * @tc        TC-ADM01-015-E05
   * @story     US-ADM01-015
   * @ac        AC-US015-05
   * @subtask   ST-ADM01-015-FE-03
   * In plain words: journey: the Administrator column has locked cells; they are disabled with the protected-right text and a click changes nothing.
   */
  test('E05 does not switch a locked cell of the Administrator role', async ({ page }) => {
    await signIn(page);
    await openMatrix(page);
    const locked = matrix(page).getByRole('switch', { name: /for Administrator$/ }).and(page.locator(':disabled'));
    expect(await locked.count()).toBeGreaterThan(0);
    const one = locked.first();
    const state = await one.isChecked();
    await expect(one.locator('xpath=ancestor::td')).toContainText('Protected right: it cannot be changed');
    await one.click({ force: true });
    expect(await one.isChecked()).toBe(state);
    await expect(page.getByTestId('matrix-counter')).toHaveCount(0);
    await shot(page, 'E05', 'locked');
  });
});
