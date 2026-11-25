/**
 * @file    role-assign.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright journeys of the role page and the assign dialog against the real built API and the built Next application (decision L-67). In plain words: the Administrator opens a role, assigns a user with a company, a first day and a reason, and the user appears in the table; the role then shows on the user (checked through the user call, the Users screen comes with its own story). The page is never reloaded (the access token lives in memory only). Screenshots are saved as `<TC-ID>_<step>.png`. The user assigned is the seeded Administrator 10001, because no call lists departments and designations to create test users.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.22 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.22.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/e2e/role-assign.spec.ts
 * @lld-synced     v0.22
 * @status         built
 */

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const stamp = Date.now().toString(36).slice(-6);
const shot = (page: Page, tc: string, step: string) => page.screenshot({ path: `${SHOTS}/TC-ADM01-013-${tc}_${step}.png`, fullPage: true });

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/Employee code/).fill('10001');
  await page.getByLabel(/Company/).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await expect(page.getByTestId('roles-table')).toBeVisible();
}

const bearer = async (request: APIRequestContext) => {
  const res = await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } });
  return { Authorization: `Bearer ${(await res.json()).data.accessToken as string}` };
};

/** Opens a role from the list by clicking its name (client navigation, no reload). */
async function openRole(page: Page, name: string) {
  await page.getByLabel('Search roles').fill(name);
  await page.getByRole('link', { name, exact: true }).first().click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

/** Assigns the Administrator 10001 through the dialog. */
async function assignThroughDialog(page: Page, tc: string, reason: string) {
  await page.getByTestId('roles-assign-button').click();
  await page.getByLabel('Search users').fill('System');
  await page.getByRole('button', { name: /Add System Administrator/ }).click();
  await page.locator('select#assign-company').selectOption('IPL');
  await page.getByLabel(/Valid from/).fill('2026-01-01');
  await shot(page, tc, 'dialog');
  await page.getByTestId('assign-submit').click();
  await page.getByRole('textbox', { name: /^Reason/ }).fill(reason);
  await page.getByTestId('reason-confirm').click();
}

const rolesOf = async (request: APIRequestContext): Promise<string[]> => {
  const res = await request.get(`${API}/users/10001`, { headers: await bearer(request) });
  return ((await res.json()).data.companies as { roles: string[] }[]).flatMap((c) => c.roles);
};

test.describe('Role assignment journeys (story 013)', () => {
  const name = `E2E ${stamp} assign`;

  test.beforeAll(async ({ request }) => {
    await request.post(`${API}/roles`, { headers: await bearer(request), data: { name, description: 'Role for the assign journey', status: 'ACTIVE', reason: 'Set-up of the journey' } });
  });

  /**
   * @tc        TC-ADM01-013-E01
   * @story     US-ADM01-013
   * @ac        AC-US013-01
   * @subtask   ST-ADM01-013-FE-03
   * In plain words: journey: users are assigned with a company, a valid-from date and a reason and appear in the role table.
   */
  test('E01 assigns a user and shows it in the table', async ({ page }) => {
    await signIn(page);
    await openRole(page, name);
    await expect(page.getByText('No users have this role yet')).toBeVisible();
    await shot(page, 'E01', 'empty-role');
    await assignThroughDialog(page, 'E01', 'Assign from the journey');
    await expect(page.getByRole('row', { name: /System Administrator/ })).toContainText('IPL');
    await expect(page.getByRole('row', { name: /System Administrator/ })).toContainText(/\d{2}-[A-Za-z]{3}-\d{4}/);
    await shot(page, 'E01', 'user-in-table');
  });

  /**
   * @tc        TC-ADM01-013-E02
   * @story     US-ADM01-013
   * @ac        AC-US013-02
   * @subtask   ST-ADM01-013-FE-03
   * In plain words: journey: the role is shown on the user afterwards (checked through the user call).
   */
  test('E02 shows the role on the user', async ({ request }) => {
    expect(await rolesOf(request)).toContain(name);
  });

  /**
   * @tc        TC-ADM01-013-E03
   * @story     US-ADM01-013
   * @ac        AC-US013-03
   * @subtask   ST-ADM01-013-FE-03
   * In plain words: journey: Report Viewer assigned to a user who has another role: the user shows both roles, and the dialog explains it.
   */
  test('E03 adds Report Viewer to the business role', async ({ page, request }) => {
    await signIn(page);
    await openRole(page, 'Report Viewer');
    await page.getByTestId('roles-assign-button').click();
    await expect(page.getByTestId('assign-info')).toContainText("added to the user's business role");
    await shot(page, 'E03', 'info-line');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await assignThroughDialog(page, 'E03', 'Report access from the journey');
    await expect(page.getByRole('row', { name: /System Administrator/ })).toBeVisible();
    await shot(page, 'E03', 'viewer-assigned');
    const roles = await rolesOf(request);
    expect(roles).toContain('Report Viewer');
    expect(roles).toContain('Administrator');
  });
});
