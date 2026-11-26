/**
 * @file    users-import.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright journey of the import wizard against the real built API and web application. In plain words: Import users, template, a file of 5 rows (1 repeated e-mail), check, import.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/e2e/users-import.spec.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { readFileSync } from 'node:fs';
import ExcelJS from 'exceljs';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const shot = (page: Page, step: string) => page.screenshot({ path: `${SHOTS}/TC-ADM01-009-E01_${step}.png`, fullPage: true });

const HEADER = ['Employee code', 'Full name', 'E-mail', 'Mobile', 'Department code', 'Designation code', 'Reporting manager code', 'Sign-in type', 'Company code', 'Role names', 'Valid from', 'Valid to'];

async function signIn(page: Page) {
  await page.goto('/login?dev=1');
  await page.getByLabel(/Employee code/).fill('10001');
  await page.getByLabel(/Company/).fill('IPL');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/roles');
  await expect(page.getByTestId('roles-table')).toBeVisible();
}

const bearer = async (request: APIRequestContext) => ({ Authorization: `Bearer ${(await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } })).json()).data.accessToken as string}` });
const items = async (request: APIRequestContext, path: string) => (await (await request.get(`${API}${path}`, { headers: await bearer(request) })).json()).data.items as { code: string; isHighest?: boolean }[];

/** The filled file: 5 rows, the fifth repeats the e-mail of the first. */
async function filledFile(request: APIRequestContext, codes: string[]): Promise<Buffer> {
  const dept = (await items(request, '/masters/departments'))[0].code;
  const desig = (await items(request, '/masters/designations')).find((d) => !d.isHighest)!.code;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Users');
  ws.addRow(HEADER);
  codes.forEach((code, i) => ws.addRow([code, `E2E Import ${code}`, i === 4 ? `import${codes[0]}@example.invalid` : `import${code}@example.invalid`, '9876543210', dept, desig, '10001', i % 2 ? 'LOCAL' : 'SSO', 'IPL', 'Initiator', '', '']));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

let codes: string[] = [];

/** Five employee codes that no user has yet (users are never deleted, so earlier runs and journeys leave codes behind). */
async function freeCodes(request: APIRequestContext): Promise<string[]> {
  for (;;) {
    const start = 70000 + Math.floor(Math.random() * 28000);
    const list = Array.from({ length: 5 }, (_, i) => String(start + i));
    const statuses = await Promise.all(list.map(async (c) => (await request.get(`${API}/users/${c}`, { headers: await bearer(request) })).status()));
    if (statuses.every((st) => st === 404)) return list;
  }
}

test.describe('Import wizard journeys (story 009)', () => {
  test.afterAll(async ({ request }) => {
    for (const code of codes) await request.post(`${API}/users/${code}/deactivate`, { headers: await bearer(request), data: { reason: 'OTHER', note: 'End of the journey run' } });
  });

  /**
   * @tc        TC-ADM01-009-E01
   * @story     US-ADM01-009
   * @ac        AC-US009-02, AC-US009-03
   * @subtask   ST-ADM01-009-IN-02
   * In plain words: the Administrator opens Users, clicks Import users, downloads the template, uploads a file of 5 rows (4 good, 1 with a repeated e-mail), sees 1 problem with its Excel row, imports, sees 4 created and 1 failed; the 4 users show in the list and the error report downloads.
   */
  test('E01 imports users through the wizard', async ({ page, request }) => {
    codes = await freeCodes(request);
    await signIn(page);
    await page.getByRole('link', { name: 'User Management' }).first().click();
    await page.getByRole('link', { name: 'Import users' }).filter({ visible: true }).click();
    await expect(page.getByText('Step 1 of 4')).toBeVisible();
    const templateDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download template' }).click();
    expect((await templateDownload).suggestedFilename()).toBe('AMS_Users_Template_v1.xlsx');
    await shot(page, 'template');
    await page.getByRole('button', { name: 'Next: upload file' }).click();
    await page.getByLabel('Filled template (.xlsx)').setInputFiles({ name: 'users.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: await filledFile(request, codes) });
    await page.getByRole('button', { name: 'Check file' }).click();
    await expect(page.getByText('Step 3 of 4')).toBeVisible();
    await expect(page.getByTestId('check-summary')).toHaveText('5 rows read. 4 can be imported. 1 has problems.');
    const line = page.getByRole('table', { name: 'Rows with problems' }).getByRole('row').nth(1);
    await expect(line).toContainText('6');
    await expect(line).toContainText('E-mail');
    await expect(line).toContainText('The e-mail is used twice in the file (rows 2 and 6)');
    await shot(page, 'check');
    const reportDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download error report' }).click();
    const report = await reportDownload;
    expect(report.suggestedFilename()).toBe('AMS_Users_Import_Errors.csv');
    expect(readFileSync((await report.path())!, 'utf8')).toContain('Row,Column,Value,Problem');
    await page.getByRole('button', { name: 'Import 4 good rows' }).click();
    await page.getByTestId('import-confirm').click();
    await expect(page.getByTestId('import-result')).toHaveText('Import finished: 4 created, 1 failed.');
    await shot(page, 'finished');
    for (const code of codes.slice(0, 4)) expect((await request.get(`${API}/users/${code}`, { headers: await bearer(request) })).status()).toBe(200);
    expect((await request.get(`${API}/users/${codes[4]}`, { headers: await bearer(request) })).status()).toBe(404);
    await page.getByRole('link', { name: 'Open Users' }).click();
    await page.getByLabel('Search users').filter({ visible: true }).fill(codes[0]);
    await expect(page.getByRole('row', { name: new RegExp(`E2E Import ${codes[0]}`) })).toBeVisible();
    await shot(page, 'list');
  });
});
