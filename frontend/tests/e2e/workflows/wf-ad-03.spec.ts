/**
 * @file    wf-ad-03.spec.ts
 * @module  Tests (workflow journeys)
 *
 * @description
 * Workflow journey WF-AD-03 (Admin workflow AD-03, "Roles and permissions"), walked from start to end as the Administrator against the real built API and web application.
 * In plain words: create a role starting from an existing one (a used name is refused, then fixed), change its rights in the permission matrix, review the changes with the sensitive-right warning, save with a reason, assign a user to the role, and see that the user gets the new right at the next call without signing in again.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @epic       EPIC-ADM-01
 * @workflow   AD-03 (steps 2 to 11)
 * @tc         WF-AD-03
 * @release    R11 (Admin A1 completion testing, MCT-01)
 * @status     built
 */

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const shot = (page: Page, step: string) => page.screenshot({ path: `${SHOTS}/WF-AD-03_${step}.png`, fullPage: true });
const stamp = Date.now().toString(36).slice(-6);
const roleName = `E2E ${stamp} wf3`;
const userCode = String(60000 + (Date.now() % 38000));

const bearer = async (request: APIRequestContext) => ({ Authorization: `Bearer ${(await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } })).json()).data.accessToken as string}` });
const items = async (request: APIRequestContext, path: string) => (await (await request.get(`${API}${path}`, { headers: await bearer(request) })).json()).data.items as { id?: string; roleId?: string; name: string; userCount?: number; isHighest?: boolean }[];

async function signIn(page: Page) {
  await page.goto('/login?dev=1');
  await page.getByLabel(/Employee code/).filter({ visible: true }).fill('10001');
  await page.getByLabel(/Company/).filter({ visible: true }).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await expect(page.getByTestId('roles-table')).toBeVisible();
}

const matrix = (page: Page) => page.getByTestId('permission-matrix');
/** "See the list and details of users" is a right with a data scope, so it is a list (No access, Own, Department, Company), not a switch. */
const usersViewScope = (page: Page) => matrix(page).getByRole('combobox', { name: new RegExp(`See the list and details of users.* for ${roleName}$`) });
const allCompaniesSwitch = (page: Page) => matrix(page).getByRole('switch', { name: new RegExp(`every company.* for ${roleName}$`) });

test.describe('Workflow AD-03: roles and permissions', () => {
  test.afterAll(async ({ request }) => {
    await request.post(`${API}/users/${userCode}/deactivate`, { headers: await bearer(request), data: { reason: 'OTHER', note: 'End of the workflow journey' } });
    const list = await items(request, `/roles?q=${encodeURIComponent(roleName)}`);
    for (const r of list) await request.post(`${API}/roles/${r.roleId}/deactivate`, { headers: await bearer(request), data: { reason: 'End of the workflow journey' } });
  });

  /**
   * @tc        WF-AD-03
   * @workflow  AD-03
   * In plain words: the whole workflow in one run: create a role from an existing one, set rights in the matrix, review, sensitive warning, reason, save, assign a user, and the user has the right at the next call.
   */
  test('WF-AD-03 walks the workflow from start to end', async ({ page, request }) => {
    const [dept] = await items(request, '/masters/departments');
    const plain = (await items(request, '/masters/designations')).find((d) => !d.isHighest)!;
    const initiator = (await items(request, '/roles')).find((r) => r.name === 'Initiator')!;

    // Set-up: an ordinary Initiator who has no right to see the user list.
    const created = await request.post(`${API}/users`, {
      headers: { ...(await bearer(request)), 'Idempotency-Key': `wf-ad-03-${userCode}` },
      data: { employeeCode: userCode, fullName: `WF Role User ${userCode}`, email: `wfrole${userCode}@example.invalid`, departmentId: dept.id, designationId: plain.id, reportingManagerCode: '10001', signIn: 'LOCAL', companies: [{ companyCode: 'IPL', roleIds: [initiator.roleId], validFrom: '2026-01-01' }] },
    });
    expect(created.status()).toBe(201);
    const token = (await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: userCode, companyCode: 'IPL' } })).json()).data.accessToken as string;
    const seeUsers = async () => (await request.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })).status();
    expect(await seeUsers()).toBe(403);

    // Steps 1 and 2: a new role is needed; the Administrator creates one starting from Initiator.
    await signIn(page);
    await page.getByRole('link', { name: 'Create role' }).click();
    await expect(page.getByRole('heading', { name: 'Create role' })).toBeVisible();
    await page.getByLabel('Start from').selectOption({ label: 'Initiator' });
    await page.getByLabel(/Description/).fill('Created by the workflow journey');

    // Step 3 (decision "name unique?" = no, then yes): a used name is refused and then fixed.
    await page.getByLabel(/Role name/).fill('Initiator');
    await page.getByTestId('roles-save-button').click();
    await page.getByRole('textbox', { name: /^Reason/ }).fill('New role for the workflow journey');
    await page.getByTestId('reason-confirm').filter({ visible: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: /exist|used/i })).toBeVisible();
    await shot(page, '01-name-used');
    await page.getByLabel(/Role name/).fill(roleName);
    await page.getByTestId('roles-save-button').click();
    await page.getByRole('textbox', { name: /^Reason/ }).fill('New role for the workflow journey');
    await page.getByTestId('reason-confirm').filter({ visible: true }).click();
    await page.waitForURL('**/roles');
    await page.getByLabel('Search roles').fill(roleName);
    await expect(page.getByRole('row', { name: new RegExp(roleName) })).toBeVisible();
    await shot(page, '02-role-created');

    // Steps 4 and 5: the rights of the new role are changed in the permission matrix.
    await page.getByRole('link', { name: 'Permission Management' }).click();
    await expect(matrix(page)).toBeVisible();
    await usersViewScope(page).selectOption('COMPANY');
    await allCompaniesSwitch(page).click();
    await expect(page.getByTestId('matrix-counter')).toHaveText('2 unsaved changes');
    await shot(page, '03-matrix-changed');

    // Steps 6 and 7 and 9: review (before, after, users affected); the sensitive right shows the warning that must be confirmed.
    await page.getByRole('button', { name: 'Review and save' }).click();
    const dialog = page.getByRole('dialog', { name: 'Review changes' });
    await expect(dialog.getByRole('row', { name: new RegExp(roleName) }).first()).toBeVisible();
    await expect(dialog.getByTestId('sensitive-warning')).toContainText('sensitive right');
    await shot(page, '04-review-warning');

    // Step 8: reason and save (Save stays off until the warning is confirmed).
    await dialog.getByLabel(/^Reason/).fill('Group reports for the workflow journey');
    const save = dialog.getByRole('button', { name: 'Save changes' });
    await expect(save).toBeDisabled();
    await dialog.getByLabel('I understand and confirm').check();
    await save.click();
    await expect(page.getByText(/2 changes saved/)).toBeVisible();
    await shot(page, '05-saved');
    expect(await seeUsers()).toBe(403); // the user does not have the role yet

    // Step 11: the Administrator assigns the user to the role.
    await page.getByRole('link', { name: 'Role Management' }).click();
    await page.getByLabel('Search roles').fill(roleName);
    await page.getByRole('link', { name: roleName, exact: true }).first().click();
    await expect(page.getByRole('heading', { name: roleName })).toBeVisible();
    await page.getByTestId('roles-assign-button').click();
    await page.getByLabel('Search users').fill(userCode);
    await page.getByRole('button', { name: new RegExp(`Add WF Role User ${userCode}`) }).click();
    await page.locator('select#assign-company').selectOption('IPL');
    await page.getByLabel(/Valid from/).fill('2026-01-01');
    await shot(page, '06-assign-dialog');
    await page.getByTestId('assign-submit').click();
    await page.getByRole('textbox', { name: /^Reason/ }).fill('Assigned by the workflow journey');
    await page.getByTestId('reason-confirm').filter({ visible: true }).click();
    await expect(page.getByRole('row', { name: new RegExp(`WF Role User ${userCode}`) })).toContainText('IPL');
    await shot(page, '07-user-in-role');

    // Step 10: the right applies at the user's next call, with the same token and no new sign-in.
    expect(await seeUsers()).toBe(200);
  });
});
