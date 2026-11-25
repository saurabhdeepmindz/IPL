/**
 * @file    user-actions.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright journeys of the user actions against the real built API and web application. In plain words: unlock a Locked user, resend a one-time password; the failed e-mail is fixme until the real e-mail adapter exists.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-008
 * @subtask        ST-ADM01-008-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/e2e/user-actions.spec.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { execSync } from 'node:child_process';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const DB = process.env.E2E_DB_EXEC ?? 'docker exec backend-postgres-1 psql -U ams -d ams -c';
const base = 56000 + (Date.now() % 3000);
let next = 0;
const newCode = () => String(base + next++ * 7);
const shot = (page: Page, tc: string, step: string) => page.screenshot({ path: `${SHOTS}/TC-ADM01-008-${tc}_${step}.png`, fullPage: true });

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

/** Makes a test user through the API; the journeys leave it Inactive afterwards. */
async function makeUser(request: APIRequestContext, code: string, signInMethod: 'SSO' | 'LOCAL') {
  const dept = (await data(request, '/masters/departments')).items[0];
  const desig = (await data(request, '/masters/designations')).items.find((d) => !d.isHighest)!;
  const initiator = (await data(request, '/roles')).items.find((r) => r.name === 'Initiator')!;
  const res = await request.post(`${API}/users`, {
    headers: { ...(await bearer(request)), 'Idempotency-Key': `actions-${code}` },
    data: { employeeCode: code, fullName: `E2E Action ${code}`, email: `action${code}@example.invalid`, departmentId: dept.id, designationId: desig.id, reportingManagerCode: '10001', signIn: signInMethod, companies: [{ companyCode: 'IPL', roleIds: [initiator.roleId], validFrom: '2026-01-01' }] },
  });
  expect(res.status()).toBe(201);
}

async function openRow(page: Page, code: string) {
  await page.getByRole('link', { name: 'User Management' }).first().click();
  await page.getByLabel('Search users').filter({ visible: true }).fill(code);
  const row = page.getByRole('row', { name: new RegExp(`E2E Action ${code}`) });
  await expect(row).toBeVisible();
  return row;
}

const made: string[] = [];

test.describe('User action journeys (story 008)', () => {
  test.afterAll(async ({ request }) => {
    for (const code of made) await request.post(`${API}/users/${code}/deactivate`, { headers: await bearer(request), data: { reason: 'OTHER', note: 'End of the journey run' } });
  });

  /**
   * @tc        TC-ADM01-008-E01
   * @story     US-ADM01-008
   * @ac        AC-US008-01
   * @subtask   ST-ADM01-008-FE-03
   * In plain words: journey: a user who is Locked (set in the test database) is unlocked from the row menu; the message shows and the row shows Active.
   */
  test('E01 unlocks a Locked user', async ({ page, request }) => {
    const code = newCode();
    made.push(code);
    await makeUser(request, code, 'SSO');
    execSync(`${DB} "update users set status = 'LOCKED' where employee_code = '${code}'"`);
    await signIn(page);
    const row = await openRow(page, code);
    await expect(row).toContainText('Locked');
    await shot(page, 'E01', 'locked');
    await row.getByRole('button', { name: `Actions for E2E Action ${code}` }).click();
    await shot(page, 'E01', 'menu');
    await page.getByRole('menuitem', { name: 'Unlock' }).click();
    const dialog = page.getByRole('dialog');
    await shot(page, 'E01', 'confirm');
    await dialog.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByTestId('user-action-notice')).toContainText(`User ${code} unlocked.`);
    await expect(page.getByRole('row', { name: new RegExp(`E2E Action ${code}`) })).toContainText('Active');
    await shot(page, 'E01', 'unlocked');
  });

  /**
   * @tc        TC-ADM01-008-E02
   * @story     US-ADM01-008
   * @ac        AC-US008-02
   * @subtask   ST-ADM01-008-FE-03
   * In plain words: journey: the failed e-mail message with Resend. Not live yet (decision L-94): the e-mail stand-in always answers SENT; the case is proved by J02 with the contract mock and becomes live with the real e-mail adapter.
   */
  test.fixme('E02 the failed e-mail message with Resend (needs the real e-mail adapter, decision L-94)', async () => {});

  /**
   * @tc        TC-ADM01-008-E03
   * @story     US-ADM01-008
   * @ac        AC-US008-03
   * @subtask   ST-ADM01-008-FE-03
   * In plain words: journey: a LOCAL user gets Resend one-time password from the row menu; the message shows that the e-mail was sent.
   */
  test('E03 resends the one-time password', async ({ page, request }) => {
    const code = newCode();
    made.push(code);
    await makeUser(request, code, 'LOCAL');
    await signIn(page);
    const row = await openRow(page, code);
    await row.getByRole('button', { name: `Actions for E2E Action ${code}` }).click();
    await expect(page.getByRole('menuitem')).toHaveText(['Reset password', 'Resend one-time password', 'Deactivate']);
    await page.getByRole('menuitem', { name: 'Resend one-time password' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(`action${code}@example.invalid`);
    await shot(page, 'E03', 'confirm');
    await dialog.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByTestId('user-action-notice')).toContainText(`A new one-time password was e-mailed to action${code}@example.invalid.`);
    await shot(page, 'E03', 'sent');
  });
});
