/**
 * @file    permission-review.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright journeys of the review and save against the real built API and web application; they save for real, on their own test role. In plain words: review and save, the sensitive warning, the locked-cell refusal.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-016
 * @subtask        ST-ADM01-016-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.7
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/e2e/permission-review.spec.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const stamp = Date.now().toString(36).slice(-6);
const shot = (page: Page, tc: string, step: string) => page.screenshot({ path: `${SHOTS}/TC-ADM01-016-${tc}_${step}.png`, fullPage: true });

type Matrix = { matrixVersion: string; roles: { roleId: string; name: string }[]; groups: { permissions: { key: string; cells: Record<string, { allowed: boolean; scope: string | null }> }[] }[] };

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/Employee code/).fill('10001');
  await page.getByLabel(/Company/).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await expect(page.getByTestId('roles-table')).toBeVisible();
}

const bearer = async (request: APIRequestContext) => ({ Authorization: `Bearer ${(await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } })).json()).data.accessToken as string}` });
const matrixOf = async (request: APIRequestContext) => (await (await request.get(`${API}/roles/permissions/matrix`, { headers: await bearer(request) })).json()).data as Matrix;
const cellOf = (m: Matrix, roleId: string, key: string) => m.groups.flatMap((g) => g.permissions).find((p) => p.key === key)!.cells[roleId];

const made: string[] = [];

/** Makes a test role through the API; the journeys change only this role. */
async function makeRole(request: APIRequestContext, name: string): Promise<string> {
  const res = await request.post(`${API}/roles`, { headers: await bearer(request), data: { name, description: 'Role for the review journey', status: 'ACTIVE', reason: 'Set-up of the journey' } });
  expect(res.status()).toBe(201);
  const roleId = (await res.json()).data.roleId as string;
  made.push(roleId);
  return roleId;
}

/** Gives the test role a right through the API (a sensitive one needs the confirmation). */
async function give(request: APIRequestContext, roleId: string, key: string, scope: 'OWN' | 'DEPARTMENT' | 'COMPANY') {
  const m = await matrixOf(request);
  const res = await request.put(`${API}/roles/permissions`, { headers: await bearer(request), data: { changes: [{ roleId, permissionKey: key, allowed: true, scope }], matrixVersion: m.matrixVersion, reason: 'Set-up of the journey', confirmSensitive: true } });
  expect(res.status()).toBe(200);
}

async function openMatrix(page: Page) {
  await page.getByRole('link', { name: 'Permission Management' }).click();
  await expect(page.getByTestId('permission-matrix')).toBeVisible();
}

const matrixTable = (page: Page) => page.getByTestId('permission-matrix');
const scopeList = (page: Page, role: string) => matrixTable(page).getByRole('combobox', { name: new RegExp(`audit log.* for ${role}$`) });
const companySwitch = (page: Page, role: string) => matrixTable(page).getByRole('switch', { name: new RegExp(`every company.* for ${role}$`) });

test.describe('Permission review journeys (story 016)', () => {
  test.afterAll(async ({ request }) => {
    for (const roleId of made) await request.post(`${API}/roles/${roleId}/deactivate`, { headers: await bearer(request), data: { reason: 'End of the journey run' } });
  });

  /**
   * @tc        TC-ADM01-016-E01
   * @story     US-ADM01-016
   * @ac        AC-US016-01
   * @subtask   ST-ADM01-016-FE-03
   * In plain words: journey: a scope is narrowed on a test role; Review and save lists it with before, after and users affected; Save is refused without a reason; with a reason and an approval reference it saves and the matrix shows the new scope.
   */
  test('E01 reviews and saves with a reason', async ({ page, request }) => {
    const name = `E2E ${stamp} review a`;
    const roleId = await makeRole(request, name);
    await give(request, roleId, 'audit.view', 'COMPANY');
    await signIn(page);
    await openMatrix(page);
    await scopeList(page, name).selectOption('DEPARTMENT');
    await expect(page.getByTestId('matrix-counter')).toHaveText('1 unsaved change');
    await page.getByRole('button', { name: 'Review and save' }).click();
    const dialog = page.getByRole('dialog', { name: 'Review changes' });
    const line = dialog.getByRole('row', { name: new RegExp(name) });
    await expect(line).toContainText('Company');
    await expect(line).toContainText('Department');
    await expect(line).toContainText('0');
    await shot(page, 'E01', 'review');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog.getByText('Enter a reason')).toBeVisible();
    await shot(page, 'E01', 'reason-missing');
    await dialog.getByLabel(/^Reason/).fill('Narrowed after the audit review');
    await dialog.getByLabel(/Approval reference/).fill('CR-016');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('1 change saved')).toBeVisible();
    await expect(page.getByTestId('matrix-counter')).toHaveCount(0);
    await expect(scopeList(page, name)).toHaveValue('DEPARTMENT');
    expect(cellOf(await matrixOf(request), roleId, 'audit.view')).toMatchObject({ allowed: true, scope: 'DEPARTMENT' });
    await shot(page, 'E01', 'saved');
  });

  /**
   * @tc        TC-ADM01-016-E02
   * @story     US-ADM01-016
   * @ac        AC-US016-02
   * @subtask   ST-ADM01-016-FE-03
   * In plain words: journey: a sensitive right (data of every company) is switched on for a test role: the warning shows and Save changes works only after the tick.
   */
  test('E02 shows the warning and needs the tick', async ({ page, request }) => {
    const name = `E2E ${stamp} review b`;
    const roleId = await makeRole(request, name);
    await signIn(page);
    await openMatrix(page);
    await companySwitch(page, name).click();
    await page.getByRole('button', { name: 'Review and save' }).click();
    const dialog = page.getByRole('dialog', { name: 'Review changes' });
    await expect(dialog.getByTestId('sensitive-warning')).toContainText('sensitive right');
    await dialog.getByLabel(/^Reason/).fill('Needed for the group reports');
    const save = dialog.getByRole('button', { name: 'Save changes' });
    await expect(save).toBeDisabled();
    await shot(page, 'E02', 'warning');
    await dialog.getByLabel('I understand and confirm').check();
    await expect(save).toBeEnabled();
    await save.click();
    await expect(page.getByText('1 change saved')).toBeVisible();
    expect(cellOf(await matrixOf(request), roleId, 'companies.view-all').allowed).toBe(true);
    await shot(page, 'E02', 'saved');
  });

  /**
   * @tc        TC-ADM01-016-E03
   * @story     US-ADM01-016
   * @ac        AC-US016-03
   * @subtask   ST-ADM01-016-FE-03
   * In plain words: journey: the save is changed in flight to include a locked cell of the Administrator role; the real server answers 403 LOCKED_CELL; the panel shows the refusal and nothing is saved.
   */
  test('E03 shows the refusal of a locked cell', async ({ page, request }) => {
    const name = `E2E ${stamp} review c`;
    const roleId = await makeRole(request, name);
    await give(request, roleId, 'audit.view', 'COMPANY');
    const before = await matrixOf(request);
    const adminId = before.roles.find((r) => r.name === 'Administrator')!.roleId;
    await signIn(page);
    await openMatrix(page);
    await page.route('**/roles/permissions', async (route) => {
      if (route.request().method() !== 'PUT') return route.fallback();
      const body = route.request().postDataJSON() as { changes: object[] };
      body.changes.push({ roleId: adminId, permissionKey: 'roles.manage', allowed: false });
      return route.continue({ postData: JSON.stringify(body) });
    });
    await scopeList(page, name).selectOption('OWN');
    await page.getByRole('button', { name: 'Review and save' }).click();
    const dialog = page.getByRole('dialog', { name: 'Review changes' });
    await dialog.getByLabel(/^Reason/).fill('Try with a locked cell');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog.getByText('A protected right cannot be changed. Nothing was saved.')).toBeVisible();
    await shot(page, 'E03', 'refused');
    expect(cellOf(await matrixOf(request), roleId, 'audit.view')).toMatchObject({ allowed: true, scope: 'COMPANY' });
    await dialog.getByRole('button', { name: 'Back to the matrix' }).click();
    await expect(page.getByTestId('matrix-counter')).toHaveText('1 unsaved change');
  });
});
