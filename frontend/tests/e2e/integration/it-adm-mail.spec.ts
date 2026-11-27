/**
 * @file    it-adm-mail.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN02-010 (QA engineer verifies the Administrator's one-time password e-mail goes out through the real adapter). In plain words: the Administrator adds a local user in the browser, User Management says the e-mail was sent, the mail trap holds the mail and the password in it signs in.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-010
 * @subtask        ST-LGN02-010-IN-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/e2e/integration/it-adm-mail.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { execSync } from 'node:child_process';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { DB, freeEmployeeCode, shot, submitPassword, tid, waitForOneTimePassword } from '../helpers/auth-journey';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
let code = '';

const lab = (page: Page, label: string | RegExp) =>
  page.getByLabel(label).filter({ visible: true });
const adminHeaders = async (request: APIRequestContext) => ({
  Authorization: `Bearer ${(await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } })).json()).data.accessToken as string}`,
});
const names = async (request: APIRequestContext, path: string) =>
  (
    await (
      await request.get(`${API}/masters/${path}`, { headers: await adminHeaders(request) })
    ).json()
  ).data.items as { name: string; isHighest?: boolean }[];

/** The Administrator signs in with the development sign-in and opens the Add user form. */
async function openAddUser(page: Page): Promise<void> {
  await page.goto('/login?dev=1');
  await lab(page, /Employee code/).fill('10001');
  await lab(page, /Company/).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await page.getByRole('link', { name: 'User Management' }).click();
  await page.getByRole('link', { name: 'Add user' }).click();
  await expect(page.getByRole('heading', { name: 'Add user' })).toBeVisible();
  await expect(page.getByRole('option', { name: /· IPL$/ }).first()).toBeAttached();
}

/** @tc IT-ADM-MAIL @workflow UF-02 (the Administrator one-time password e-mail through the real adapter) @story US-LGN02-010 @subtask ST-LGN02-010-IN-02 */
test.describe('QA engineer verifies the Administrator one-time password e-mail goes out through the real adapter (US-LGN02-010)', () => {
  test.afterAll(async ({ request }) => {
    if (!code) return;
    await request.post(`${API}/users/${code}/deactivate`, {
      headers: await adminHeaders(request),
      data: { reason: 'OTHER', note: 'End of the integration journey' },
    });
    for (const sql of [
      `delete from audit_log where entity_key = '${code}' or entity_key in (select id::text from users where employee_code = '${code}')`,
      `delete from one_time_passwords where user_id in (select id from users where employee_code = '${code}')`,
      `delete from user_company_roles where user_id in (select id from users where employee_code = '${code}')`,
      `delete from users where employee_code = '${code}'`,
    ])
      execSync(`${DB} "${sql}"`);
  });

  /** @tc TC-LGN02-010-E01 @story US-LGN02-010 @ac AC-US-LGN02-010-01 @subtask ST-LGN02-010-IN-02 */
  test('TC-LGN02-010-E01 the Administrator adds a local user, User Management says the e-mail was sent, the mail trap holds it and the password in it signs in', async ({
    page,
    browser,
    request,
  }) => {
    code = freeEmployeeCode(63000, 999);
    const email = `itadmmail${code}@example.invalid`;
    const dept = (await names(request, 'departments'))[0].name;
    const desig = (await names(request, 'designations')).find((d) => !d.isHighest)!.name;
    await openAddUser(page);
    await lab(page, /Employee code/).fill(code);
    await lab(page, /Full name/).fill(`IT Mail ${code}`);
    await lab(page, /Official e-mail/).fill(email);
    await lab(page, /^Department/).selectOption({ label: dept });
    await lab(page, /^Designation/).selectOption({ label: desig });
    await lab(page, /Reporting manager/).selectOption('10001');
    await page.getByLabel('Local password').check();
    await page.locator('select#company-0').selectOption('IPL');
    await page
      .getByRole('group', { name: 'Roles for company 1' })
      .getByRole('combobox', { name: 'Add role' })
      .selectOption({ label: 'Initiator' });
    await page.locator('#from-0').fill('2026-01-01');
    await page.getByRole('button', { name: /^Save user|^Save/ }).click();
    await expect(page.getByTestId('users-notice')).toContainText(
      'The one-time password was e-mailed.',
    );
    await shot(page, 'TC-LGN02-010-E01_user-management-notice');
    const password = await waitForOneTimePassword(email);
    const fresh = await (await browser.newContext()).newPage();
    await fresh.goto('/login');
    await submitPassword(fresh, code, password);
    await fresh.waitForURL('**/choose-password');
    await expect(tid(fresh, 'choose-page')).toBeVisible();
    await shot(fresh, 'TC-LGN02-010-E01_signed-in-with-the-emailed-password');
  });
});
