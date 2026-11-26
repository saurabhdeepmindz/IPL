/**
 * @file    wf-ad-02.spec.ts
 * @module  Tests (workflow journeys)
 *
 * @description
 * Workflow journey WF-AD-02 (Admin workflow AD-02, "Add, change and deactivate users"), walked from start to end as the Administrator against the real built API and web application.
 * In plain words: add a user (a used code is refused, then fixed), import a second user from Excel, unlock a locked user and resend a one-time password, deactivate the added user with a reason, and see that the deactivated user can no longer sign in.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @epic       EPIC-ADM-01
 * @workflow   AD-02 (steps 2 to 10; step 7 "holds proposals" is proved by the stand-in only, see DEP-03; step 11 sign-in is proved against the development sign-in only, see DEP-01)
 * @tc         WF-AD-02
 * @release    R11 (Admin A1 completion testing, MCT-01)
 * @status     built
 */

import { execSync } from 'node:child_process';
import ExcelJS from 'exceljs';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const DB = process.env.E2E_DB_EXEC ?? 'docker exec backend-postgres-1 psql -U ams -d ams -c';
const shot = (page: Page, step: string) => page.screenshot({ path: `${SHOTS}/WF-AD-02_${step}.png`, fullPage: true });
const made: string[] = [];
/** Next 16 keeps visited pages hidden in the page, so only the visible field of a label counts. */
const lab = (page: Page, label: string | RegExp) => page.getByLabel(label).filter({ visible: true });

const bearer = async (request: APIRequestContext) => ({ Authorization: `Bearer ${(await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } })).json()).data.accessToken as string}` });
const items = async (request: APIRequestContext, path: string) => (await (await request.get(`${API}${path}`, { headers: await bearer(request) })).json()).data.items as { id?: string; roleId?: string; code: string; name: string; isHighest?: boolean }[];

/** An employee code that no user has yet (users are never deleted, so earlier runs leave codes behind). */
async function freeCode(request: APIRequestContext): Promise<string> {
  for (;;) {
    const code = String(60000 + Math.floor(Math.random() * 38000));
    if ((await request.get(`${API}/users/${code}`, { headers: await bearer(request) })).status() === 404 && !made.includes(code)) {
      made.push(code);
      return code;
    }
  }
}

async function signIn(page: Page) {
  await page.goto('/login?dev=1');
  await lab(page, /Employee code/).fill('10001');
  await lab(page, /Company/).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await expect(page.getByTestId('roles-table')).toBeVisible();
}

const devToken = (request: APIRequestContext, code: string) => request.post(`${API}/dev/sign-in`, { data: { employeeCode: code, companyCode: 'IPL' } });

test.describe('Workflow AD-02: add, change and deactivate users', () => {
  test.afterAll(async ({ request }) => {
    for (const code of made) await request.post(`${API}/users/${code}/deactivate`, { headers: await bearer(request), data: { reason: 'OTHER', note: 'End of the workflow journey' } });
  });

  /**
   * @tc        WF-AD-02
   * @workflow  AD-02
   * In plain words: the whole workflow in one run: start (a joiner and a leaver), add, import, unlock, resend, deactivate, and the leaver cannot sign in.
   */
  test('WF-AD-02 walks the workflow from start to end', async ({ page, request }) => {
    const [dept] = await items(request, '/masters/departments');
    const plain = (await items(request, '/masters/designations')).find((d) => !d.isHighest)!;
    const initiator = (await items(request, '/roles')).find((r) => r.name === 'Initiator')!;
    const added = await freeCode(request);
    const imported = await freeCode(request);
    const locked = await freeCode(request);

    // Set-up of the "access request": a LOCAL user who is locked (made through the API, locked in the test database).
    const res = await request.post(`${API}/users`, {
      headers: { ...(await bearer(request)), 'Idempotency-Key': `wf-ad-02-${locked}` },
      data: { employeeCode: locked, fullName: `WF Locked ${locked}`, email: `wflocked${locked}@example.invalid`, departmentId: dept.id, designationId: plain.id, reportingManagerCode: '10001', signIn: 'LOCAL', companies: [{ companyCode: 'IPL', roleIds: [initiator.roleId], validFrom: '2026-01-01' }] },
    });
    expect(res.status()).toBe(201);
    execSync(`${DB} "update users set status = 'LOCKED' where employee_code = '${locked}'"`);

    // Steps 1 and 2: the Administrator signs in and chooses "add".
    await signIn(page);
    await page.getByRole('link', { name: 'User Management' }).click();
    await shot(page, '01-user-list');
    await page.getByRole('link', { name: 'Add user' }).click();
    await expect(page.getByRole('heading', { name: 'Add user' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'IPL', exact: true }).first()).toBeAttached();

    // Steps 3, 6 and 8: fill the form; the code is already used (decision "unique?" = no), fix it, give company, role and validity.
    const fill = async (code: string) => {
      await lab(page, /Employee code/).fill(code);
      await lab(page, /Full name/).fill(`WF Added ${added}`);
      await lab(page, /Official e-mail/).fill(`wfadded${added}@example.invalid`);
    };
    await fill('10001');
    await lab(page, /^Department/).selectOption({ label: dept.name });
    await lab(page, /^Designation/).selectOption({ label: plain.name });
    await lab(page, /Reporting manager/).selectOption('10001');
    await page.locator('select#company-0').selectOption('IPL');
    await page.getByRole('group', { name: 'Roles for company 1' }).getByRole('checkbox', { name: 'Initiator' }).check();
    await page.locator('#from-0').fill('2026-01-01');
    await page.getByTestId('user-save-button').click();
    await expect(page.getByText('This employee code is already used')).toBeVisible();
    await shot(page, '02-code-used');
    await fill(added);
    await page.getByTestId('user-save-button').click();

    // Step 10 (saves): the user is in the list as Active with the company and role.
    await expect(page.getByTestId('users-notice')).toContainText(added);
    await lab(page, 'Search users').fill(added);
    const addedRow = page.getByRole('row', { name: new RegExp(added) });
    await expect(addedRow).toContainText('Active');
    await expect(addedRow).toContainText('IPL: Initiator');
    await shot(page, '03-added-in-list');
    expect((await devToken(request, added)).ok()).toBe(true);

    // Step 4: import a second user from Excel (template, check, import the good rows).
    await page.getByRole('link', { name: 'Import users' }).filter({ visible: true }).click();
    await expect(page.getByText('Step 1 of 4')).toBeVisible();
    await page.getByRole('button', { name: 'Next: upload file' }).click();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Users');
    ws.addRow(['Employee code', 'Full name', 'E-mail', 'Mobile', 'Department code', 'Designation code', 'Reporting manager code', 'Sign-in type', 'Company code', 'Role names', 'Valid from', 'Valid to']);
    const deptCode = dept.code;
    const desigCode = plain.code;
    ws.addRow([imported, `WF Imported ${imported}`, `wfimported${imported}@example.invalid`, '9876543210', deptCode, desigCode, '10001', 'LOCAL', 'IPL', 'Initiator', '', '']);
    await page.getByLabel('Filled template (.xlsx)').setInputFiles({ name: 'users.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(await wb.xlsx.writeBuffer()) });
    await expect(page.getByText('Step 3 of 4')).toBeVisible();
    await shot(page, '04-import-check');
    await page.getByRole('button', { name: 'Import the rows that passed' }).click();
    await expect(page.getByTestId('import-result')).toContainText('Import finished: 1 created');
    await shot(page, '05-import-finished');
    expect((await request.get(`${API}/users/${imported}`, { headers: await bearer(request) })).status()).toBe(200);
    await page.getByRole('link', { name: 'Open Users' }).click();

    // Step 5 (unlock) and step 10 (one-time password): the locked LOCAL user is unlocked and gets a new one-time password.
    await lab(page, 'Search users').fill(locked);
    const lockedRow = page.getByRole('row', { name: new RegExp(`WF Locked ${locked}`) });
    await expect(lockedRow).toContainText('Locked');
    await lockedRow.getByRole('button', { name: `Actions for WF Locked ${locked}` }).click();
    await page.getByRole('menuitem', { name: 'Unlock' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByTestId('user-action-notice')).toContainText(`User ${locked} unlocked.`);
    await expect(page.getByRole('row', { name: new RegExp(`WF Locked ${locked}`) })).toContainText('Active');
    await shot(page, '06-unlocked');
    await page.getByRole('row', { name: new RegExp(`WF Locked ${locked}`) }).getByRole('button', { name: `Actions for WF Locked ${locked}` }).click();
    await page.getByRole('menuitem', { name: 'Resend one-time password' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByTestId('user-action-notice')).toContainText(`wflocked${locked}@example.invalid`);
    await shot(page, '07-one-time-password');

    // Steps 5 and 7: the leaver (the added user) is deactivated with a reason; no proposals are held (decision "holds proposals?" = no).
    await lab(page, 'Search users').fill(added);
    await page.getByRole('link', { name: added, exact: true }).click();
    await expect(page.getByRole('heading', { name: `WF Added ${added}` })).toBeVisible();
    await page.getByRole('button', { name: 'Deactivate' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/Reason/).selectOption('LEFT_COMPANY');
    await shot(page, '08-deactivate-dialog');
    await dialog.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('User deactivated')).toBeVisible();
    await expect(page.getByTestId('user-detail').getByTestId('status-badge')).toHaveText('Inactive');
    await shot(page, '09-inactive');

    // Step 11 (end): the leaver can no longer sign in; the joiner still can (checked against the development sign-in until Login is built).
    expect((await devToken(request, added)).ok()).toBe(false);
    expect((await devToken(request, imported)).ok()).toBe(true);
  });
});
