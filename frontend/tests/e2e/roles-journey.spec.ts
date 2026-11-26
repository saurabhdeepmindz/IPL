/**
 * @file    roles-journey.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright journeys of the roles screens against the real built API and the built Next application (decision L-67). In plain words: the Administrator signs in with the development form, lists roles, creates a role, meets the name clash, sees the locked Administrator role and a role that users hold, and the save waits for a reason. Screenshots are saved as `<TC-ID>_<step>.png`. The page is never reloaded (the access token lives in memory only, decision L-64).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/e2e/roles-journey.spec.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const stamp = Date.now().toString(36).slice(-6);
const shot = (page: Page, tc: string, step: string) => page.screenshot({ path: `${SHOTS}/TC-ADM01-012-${tc}_${step}.png`, fullPage: true });

/** Sign in through the development form (no reload afterwards: the token lives in memory). */
async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/Employee code/).fill('10001');
  await page.getByLabel(/Company/).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await expect(page.getByRole('heading', { name: 'Role Management' })).toBeVisible();
  await expect(page.getByTestId('roles-table')).toBeVisible();
}

/** A token for the set-up calls made straight to the API. */
async function apiToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } });
  return (await res.json()).data.accessToken as string;
}

const roleNames = async (request: APIRequestContext, token: string, q = ''): Promise<string[]> => {
  const res = await request.get(`${API}/roles`, { headers: { Authorization: `Bearer ${token}` }, params: q ? { q } : {} });
  return ((await res.json()).data.items as { name: string }[]).map((r) => r.name);
};

test.describe('Roles journeys (story 012)', () => {
  let token: string;
  const made: string[] = [];

  test.beforeAll(async ({ request }) => {
    token = await apiToken(request);
  });

  test.afterAll(async ({ request }) => {
    const list = await (await request.get(`${API}/roles`, { headers: { Authorization: `Bearer ${token}` }, params: { q: `E2E ${stamp}` } })).json();
    for (const r of list.data.items as { roleId: string; userCount: number }[]) {
      if (r.userCount === 0) await request.post(`${API}/roles/${r.roleId}/deactivate`, { headers: { Authorization: `Bearer ${token}` }, data: { reason: 'End of the test run' } });
    }
  });

  /**
   * @tc        TC-ADM01-012-E01
   * @story     US-ADM01-012
   * @ac        AC-US012-01
   * @subtask   ST-ADM01-012-FE-03
   * In plain words: journey: the role list opens with type, users, last changed and status, and the filters work.
   */
  test('E01 lists the roles and filters them', async ({ page, request }) => {
    await signIn(page);
    await shot(page, 'E01', 'list');
    const all = await roleNames(request, token);
    await expect(page.getByRole('row')).toHaveCount(all.length + 1);
    await expect(page.getByRole('row', { name: /Administrator/ })).toContainText('Standard');
    await page.getByLabel('Type').selectOption('CUSTOM');
    await expect(page.getByRole('row').filter({ hasText: 'Standard' })).toHaveCount(0);
    await shot(page, 'E01', 'custom-only');
    await page.getByLabel('Type').selectOption('');
    await page.getByLabel('Status').selectOption('ACTIVE');
    await expect(page.getByRole('row').filter({ hasText: 'Draft' })).toHaveCount(0);
    await shot(page, 'E01', 'active-only');
  });

  /**
   * @tc        TC-ADM01-012-E02
   * @story     US-ADM01-012
   * @ac        AC-US012-02
   * @subtask   ST-ADM01-012-FE-03
   * In plain words: journey: a role is created with a unique name, a description and a reason and appears in the list.
   */
  test('E02 creates a role', async ({ page }) => {
    const name = `E2E ${stamp} create`;
    made.push(name);
    await signIn(page);
    await page.getByRole('link', { name: 'Create role' }).click();
    await expect(page.getByRole('heading', { name: 'Create role' })).toBeVisible();
    await page.getByLabel(/Role name/).fill(name);
    await page.getByLabel(/Description/).fill('Created by the journey');
    await page.locator('[data-testid=roles-switches] input').first().check();
    await shot(page, 'E02', 'form');
    await page.getByTestId('roles-save-button').click();
    await page.getByRole('textbox', { name: /^Reason/ }).fill('New role from the journey');
    await shot(page, 'E02', 'reason');
    await page.getByTestId('reason-confirm').click();
    await page.waitForURL('**/roles');
    await page.getByLabel('Search roles').fill(name);
    await expect(page.getByRole('row', { name: new RegExp(name) })).toBeVisible();
    await shot(page, 'E02', 'in-list');
  });

  /**
   * @tc        TC-ADM01-012-E03
   * @story     US-ADM01-012
   * @ac        AC-US012-03
   * @subtask   ST-ADM01-012-FE-03
   * In plain words: journey: a name that exists shows the message on the name field.
   */
  test('E03 shows the name-exists message', async ({ page }) => {
    await signIn(page);
    await page.getByRole('link', { name: 'Create role' }).click();
    await page.getByLabel(/Role name/).fill('Initiator');
    await page.getByLabel(/Description/).fill('Duplicate');
    await page.getByTestId('roles-save-button').click();
    await page.getByRole('textbox', { name: /^Reason/ }).fill('Try the duplicate');
    await page.getByTestId('reason-confirm').click();
    await expect(page.getByRole('alert').filter({ hasText: /exist|used/i })).toBeVisible();
    await shot(page, 'E03', 'name-exists');
    await expect(page.getByRole('heading', { name: 'Create role' })).toBeVisible();
  });

  /**
   * @tc        TC-ADM01-012-E04
   * @story     US-ADM01-012
   * @ac        AC-US012-04
   * @subtask   ST-ADM01-012-FE-03
   * In plain words: journey: the Administrator role shows its lock and cannot be deactivated.
   */
  test('E04 locks the Administrator role', async ({ page }) => {
    await signIn(page);
    const row = page.getByRole('row', { name: /Administrator/ });
    await expect(row).toContainText('Locked');
    await expect(row.getByRole('button', { name: /Deactivate/ })).toHaveCount(0);
    await expect(row.getByRole('link', { name: /Edit/ })).toHaveCount(0);
    await shot(page, 'E04', 'locked');
  });

  /**
   * @tc        TC-ADM01-012-E05
   * @story     US-ADM01-012
   * @ac        AC-US012-05
   * @subtask   ST-ADM01-012-FE-03
   * In plain words: journey: a role that users hold is not deactivated and the count is shown.
   */
  test('E05 does not deactivate a role that users hold', async ({ page, request }) => {
    const name = `E2E ${stamp} held`;
    const created = await request.post(`${API}/roles`, { headers: { Authorization: `Bearer ${token}` }, data: { name, description: 'Held by one user', status: 'ACTIVE', reason: 'Set-up of the journey' } });
    const roleId = (await created.json()).data.roleId as string;
    await request.post(`${API}/roles/${roleId}/users`, { headers: { Authorization: `Bearer ${token}` }, data: { employeeCodes: ['10001'], companyCode: 'IPL', validFrom: '2026-01-01', reason: 'Set-up of the journey' } });
    await signIn(page);
    await page.getByLabel('Search roles').fill(name);
    await page.getByRole('button', { name: `Deactivate ${name}` }).click();
    await page.getByRole('textbox', { name: /^Reason/ }).fill('Try to deactivate');
    await page.getByTestId('reason-confirm').click();
    await expect(page.getByText(/1 user holds this role/)).toBeVisible();
    await shot(page, 'E05', 'role-in-use');
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByRole('row', { name: new RegExp(name) })).toContainText('Active');
  });

  /**
   * @tc        TC-ADM01-012-E06
   * @story     US-ADM01-012
   * @ac        AC-US012-06
   * @subtask   ST-ADM01-012-FE-03
   * In plain words: journey: the save waits for a reason: an empty reason sends nothing.
   */
  test('E06 requires a reason before the save', async ({ page, request }) => {
    const name = `E2E ${stamp} noreason`;
    await signIn(page);
    await page.getByRole('link', { name: 'Create role' }).click();
    await page.getByLabel(/Role name/).fill(name);
    await page.getByLabel(/Description/).fill('Needs a reason');
    await page.getByTestId('roles-save-button').click();
    await page.getByTestId('reason-confirm').click();
    await expect(page.getByText('Enter a reason')).toBeVisible();
    await shot(page, 'E06', 'enter-a-reason');
    expect(await roleNames(request, token, name)).toEqual([]);
  });

  /**
   * @tc        TC-ADM01-012-E07
   * @story     US-ADM01-012
   * @ac        AC-US012-07
   * @subtask   ST-ADM01-012-FE-03
   * In plain words: journey: the list shows the final-approver note and only the roles the API returns.
   */
  test('E07 shows the final-approver note and no position-based roles', async ({ page, request }) => {
    await signIn(page);
    await expect(page.getByTestId('roles-final-approver-note')).toContainText('A final approver is not a role');
    const names = await roleNames(request, token);
    for (const n of names) await expect(page.getByRole('row', { name: new RegExp(n) }).first()).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(names.length + 1);
    await shot(page, 'E07', 'note');
  });
});
