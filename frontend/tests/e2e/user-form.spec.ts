/**
 * @file    user-form.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright journeys of the add and edit user form against the real built API and web application. In plain words: add a user, the duplicate code, two companies, the read-only code, the reporting manager rule.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/e2e/user-form.spec.ts
 * @lld-synced     v0.26
 * @status         pseudo
 */

import { execSync } from 'node:child_process';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const DB = process.env.E2E_DB_EXEC ?? 'docker exec backend-postgres-1 psql -U ams -d ams -c';
const base = 40000 + (Date.now() % 9000);
let next = 0;
const newCode = () => String(base + next++ * 7);
const shot = (page: Page, tc: string, step: string) => page.screenshot({ path: `${SHOTS}/TC-ADM01-004-${tc}_${step}.png`, fullPage: true });
const made: string[] = [];
/** Next 16 keeps visited pages hidden in the page, so only the visible field of a label counts. */
const lab = (page: Page, label: string | RegExp) => page.getByLabel(label).filter({ visible: true });

async function signIn(page: Page) {
  await page.goto('/login');
  await lab(page, /Employee code/).fill('10001');
  await lab(page, /Company/).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await expect(page.getByTestId('roles-table')).toBeVisible();
}

const bearer = async (request: APIRequestContext) => ({ Authorization: `Bearer ${(await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } })).json()).data.accessToken as string}` });
const items = async (request: APIRequestContext, path: string) => ((await (await request.get(`${API}/masters/${path}`, { headers: await bearer(request) })).json()).data.items as { id: string; name: string; isHighest?: boolean }[]);

async function openAddForm(page: Page) {
  await page.getByRole('link', { name: 'User Management' }).click();
  await page.getByRole('link', { name: 'Add user' }).click();
  await expect(page.getByRole('heading', { name: 'Add user' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'IPL', exact: true }).first()).toBeAttached();
}

type Names = { dept: string; plain: string; top: string };

async function fillForm(page: Page, names: Names, code: string, over: { designation?: string; manager?: boolean; email?: string } = {}) {
  await lab(page, /Employee code/).fill(code);
  await lab(page, /Full name/).fill(`E2E User ${code}`);
  await lab(page, /Official e-mail/).fill(over.email ?? `e2e${code}@example.invalid`);
  await lab(page, /^Department/).selectOption({ label: names.dept });
  await lab(page, /^Designation/).selectOption({ label: over.designation ?? names.plain });
  if (over.manager !== false) await lab(page, /Reporting manager/).selectOption('10001');
  await page.locator('select#company-0').selectOption('IPL');
  await page.getByRole('group', { name: 'Roles for company 1' }).getByRole('checkbox', { name: 'Initiator' }).check();
  await page.locator('#from-0').fill('2026-01-01');
}

test.describe('User form journeys (story 004)', () => {
  let names: Names;

  test.beforeAll(async ({ request }) => {
    const [dept] = await items(request, 'departments');
    const desigs = await items(request, 'designations');
    names = { dept: dept.name, plain: desigs.find((d) => !d.isHighest)!.name, top: desigs.find((d) => d.isHighest)!.name };
  });

  test.afterAll(async ({ request }) => {
    for (const code of made) await request.post(`${API}/users/${code}/deactivate`, { headers: await bearer(request), data: { reason: 'OTHER', note: 'End of the journey run' } });
  });

  /**
   * @tc        TC-ADM01-004-E01
   * @story     US-ADM01-004
   * @ac        AC-US004-01
   * @subtask   ST-ADM01-004-FE-03
   * In plain words: journey: a user is added with every mandatory field and appears in the list as Active.
   */
  test('E01 adds a user', async ({ page }) => {
    const code = newCode();
    made.push(code);
    await signIn(page);
    await openAddForm(page);
    await fillForm(page, names, code);
    await shot(page, 'E01', 'form');
    await page.getByTestId('user-save-button').click();
    await expect(page.getByTestId('users-notice')).toContainText(code);
    await lab(page, 'Search users').fill(code);
    const row = page.getByRole('row', { name: new RegExp(code) });
    await expect(row).toContainText('Active');
    await expect(row).toContainText('IPL: Initiator');
    await shot(page, 'E01', 'in-list');
  });

  /**
   * @tc        TC-ADM01-004-E02
   * @story     US-ADM01-004
   * @ac        AC-US004-02
   * @subtask   ST-ADM01-004-FE-03
   * In plain words: journey: a code that exists shows the duplicate message on the code field and keeps the other fields.
   */
  test('E02 shows the duplicate code message', async ({ page }) => {
    await signIn(page);
    await openAddForm(page);
    await fillForm(page, names, '10001', { email: `dup${base}@example.invalid` });
    await page.getByTestId('user-save-button').click();
    await expect(page.getByText('This employee code is already used')).toBeVisible();
    await expect(lab(page, /Full name/)).toHaveValue('E2E User 10001');
    await shot(page, 'E02', 'duplicate');
  });

  /**
   * @tc        TC-ADM01-004-E03
   * @story     US-ADM01-004
   * @ac        AC-US004-03
   * @subtask   ST-ADM01-004-FE-03
   * In plain words: journey: two company rows with different roles are saved and the list shows one chip per company.
   */
  test('E03 saves two companies', async ({ page }) => {
    const code = newCode();
    made.push(code);
    await signIn(page);
    await openAddForm(page);
    await fillForm(page, names, code);
    await page.getByRole('button', { name: 'Add company' }).click();
    await page.locator('select#company-1').selectOption('IPLFB');
    await page.getByRole('group', { name: 'Roles for company 2' }).getByRole('checkbox', { name: 'Auditor' }).check();
    await page.locator('#from-1').fill('2026-01-01');
    await expect(page.getByTestId('user-access-summary')).toContainText('IPLFB: Auditor');
    await shot(page, 'E03', 'two-companies');
    await page.getByTestId('user-save-button').click();
    await expect(page.getByTestId('users-notice')).toContainText(code);
    await lab(page, 'Search users').fill(code);
    const row = page.getByRole('row', { name: new RegExp(code) });
    await expect(row).toContainText('IPL: Initiator');
    await expect(row).toContainText('IPLFB: Auditor');
    await shot(page, 'E03', 'two-chips');
  });

  /**
   * @tc        TC-ADM01-004-E04
   * @story     US-ADM01-004
   * @ac        AC-US004-04
   * @subtask   ST-ADM01-004-FE-03
   * In plain words: journey: in Edit the code is editable for a user who has not signed in and read-only for one who has (the first sign-in date is set in the test database).
   */
  test('E04 makes the code read-only after the first sign-in', async ({ page }) => {
    const code = newCode();
    const signed = newCode();
    made.push(code, signed);
    for (const c of [code, signed]) {
      await signIn(page);
      await openAddForm(page);
      await fillForm(page, names, c);
      await page.getByTestId('user-save-button').click();
      await expect(page.getByTestId('users-notice')).toContainText(c);
    }
    execSync(`${DB} "update users set first_sign_in_at = now() where employee_code = '${signed}'"`);
    await lab(page, 'Search users').fill(code);
    await page.getByRole('link', { name: `Edit E2E User ${code}` }).click();
    await expect(page.getByRole('heading', { name: 'Edit user' })).toBeVisible();
    await expect(lab(page, /Full name/)).toHaveValue(`E2E User ${code}`);
    await expect(lab(page, /Employee code/)).not.toHaveAttribute('readonly');
    await shot(page, 'E04', 'editable');
    await page.getByRole('link', { name: 'Cancel' }).click();
    await lab(page, 'Search users').fill(signed);
    await page.getByRole('link', { name: `Edit E2E User ${signed}` }).click();
    await expect(lab(page, /Full name/)).toHaveValue(`E2E User ${signed}`);
    await expect(lab(page, /Employee code/)).toHaveAttribute('readonly', '');
    await shot(page, 'E04', 'read-only');
  });

  /**
   * @tc        TC-ADM01-004-E05
   * @story     US-ADM01-004
   * @ac        AC-US004-05
   * @subtask   ST-ADM01-004-FE-03
   * In plain words: journey: the highest designation saves without a reporting manager; another designation shows the message.
   */
  test('E05 applies the reporting manager rule', async ({ page }) => {
    const code = newCode();
    made.push(code);
    await signIn(page);
    await openAddForm(page);
    await fillForm(page, names, code, { manager: false });
    await page.getByTestId('user-save-button').click();
    await expect(page.getByText('Choose a reporting manager')).toBeVisible();
    await shot(page, 'E05', 'manager-required');
    await lab(page, /^Designation/).selectOption({ label: names.top });
    await page.getByTestId('user-save-button').click();
    await expect(page.getByTestId('users-notice')).toContainText(code);
    await shot(page, 'E05', 'saved-without-manager');
  });
});
