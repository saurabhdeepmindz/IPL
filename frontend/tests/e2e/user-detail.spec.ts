/**
 * @file    user-detail.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright journeys of the user details against the real built API and web application. In plain words: open a user from the list and deactivate; the proposals warning (fixme until the workflow epic).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-006
 * @subtask        ST-ADM01-006-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/e2e/user-detail.spec.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const code = String(50000 + (Date.now() % 9000));
const shot = (page: Page, tc: string, step: string) => page.screenshot({ path: `${SHOTS}/TC-ADM01-006-${tc}_${step}.png`, fullPage: true });

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/Employee code/).fill('10001');
  await page.getByLabel(/Company/).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await expect(page.getByTestId('roles-table')).toBeVisible();
}

const bearer = async (request: APIRequestContext) => ({ Authorization: `Bearer ${(await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } })).json()).data.accessToken as string}` });
const data = async (request: APIRequestContext, path: string) => (await (await request.get(`${API}${path}`, { headers: await bearer(request) })).json()).data as { items: { id?: string; roleId?: string; name: string; isHighest?: boolean }[] };

test.describe('User details journeys (story 006)', () => {
  /**
   * @tc        TC-ADM01-006-E01
   * @story     US-ADM01-006
   * @ac        AC-US006-01
   * @subtask   ST-ADM01-006-FE-03
   * In plain words: journey: a test user is opened from the list; the three tabs show their data; the user is deactivated with a reason, shows Inactive and is no longer in the Active tab.
   */
  test('E01 opens a user and deactivates', async ({ page, request }) => {
    const dept = (await data(request, '/masters/departments')).items[0];
    const desig = (await data(request, '/masters/designations')).items.find((d) => !d.isHighest)!;
    const initiator = (await data(request, '/roles')).items.find((r) => r.name === 'Initiator')!;
    const created = await request.post(`${API}/users`, {
      headers: { ...(await bearer(request)), 'Idempotency-Key': `detail-${code}` },
      data: { employeeCode: code, fullName: `E2E Detail ${code}`, email: `detail${code}@example.invalid`, departmentId: dept.id, designationId: desig.id, reportingManagerCode: '10001', signIn: 'SSO', companies: [{ companyCode: 'IPL', roleIds: [initiator.roleId], validFrom: '2026-01-01' }] },
    });
    expect(created.status()).toBe(201);

    await signIn(page);
    await page.getByRole('link', { name: 'User Management' }).click();
    await page.getByLabel('Search users').filter({ visible: true }).fill(code);
    await page.getByRole('link', { name: code, exact: true }).click();
    await expect(page.getByRole('heading', { name: `E2E Detail ${code}` })).toBeVisible();
    await expect(page.getByTestId('user-overview')).toContainText(`detail${code}@example.invalid`);
    await shot(page, 'E01', 'overview');
    await page.getByRole('tab', { name: 'Companies and roles' }).click();
    await expect(page.getByRole('row', { name: /IPL/ })).toContainText('Initiator');
    await shot(page, 'E01', 'companies');
    await page.getByRole('tab', { name: 'Activity' }).click();
    await shot(page, 'E01', 'activity');

    await page.getByRole('button', { name: 'Deactivate' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Confirm' }).click();
    await expect(dialog.getByText('Choose a reason')).toBeVisible();
    await dialog.getByLabel(/Reason/).selectOption('LEFT_COMPANY');
    await shot(page, 'E01', 'dialog');
    await dialog.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('User deactivated')).toBeVisible();
    await expect(page.getByTestId('user-detail').getByTestId('status-badge')).toHaveText('Inactive');
    await expect(page.getByTestId('user-detail').getByRole('button', { name: 'Deactivate' })).toHaveCount(0);
    await shot(page, 'E01', 'inactive');

    await page.getByRole('link', { name: 'User Management' }).first().click();
    await page.getByLabel('Search users').filter({ visible: true }).fill(code);
    await page.getByRole('tab', { name: /^Active/ }).click();
    await expect(page.getByText('No users match your search')).toBeVisible();
    await page.getByRole('tab', { name: /^Inactive/ }).click();
    await expect(page.getByRole('row', { name: new RegExp(code) })).toContainText('Inactive');
    await shot(page, 'E01', 'in-inactive-tab');
  });

  /**
   * @tc        TC-ADM01-006-E02
   * @story     US-ADM01-006
   * @ac        AC-US006-02
   * @subtask   ST-ADM01-006-FE-03
   * In plain words: journey: the proposals warning. Not live yet (decision L-84): the workflow stand-in always returns 0 proposals, so no real user can hold any; the case is proved by J02 with the contract mock and becomes live in the workflow epic.
   */
  test.fixme('E02 the proposals warning (needs the workflow epic, decision L-84)', async () => {});
});
