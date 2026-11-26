/**
 * @file    it-adm-lgn.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of US-LGN01-009 (QA engineer verifies sign-in end to end with the Administrator module). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-009
 * @subtask        ST-LGN01-009-IN-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/e2e/integration/it-adm-lgn.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { execSync } from 'node:child_process';
import { expect, test, type APIRequestContext } from '@playwright/test';
import { DB, PASSWORD, removeMadeUsers, shot, submitPassword, tid } from '../helpers/auth-journey';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const HASH = '$2b$12$2jFUI/81n4RIbETaphMEPOz9agYiEQ9ssh5jia3BPY87Dt8B1ectq';
const created: string[] = [];

const admin = async (request: APIRequestContext) => ({ Authorization: `Bearer ${(await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } })).json()).data.accessToken as string}` });

/** The Administrator adds a password user through the API; the one-time password e-mail arrives with EPIC-LGN-02, so a known password hash is set in the database instead (stand-in register). */
async function adminCreates(request: APIRequestContext): Promise<string> {
  const code = String(50000 + (Math.floor(Math.random() * 9000) + (Date.now() % 1000)) % 9999);
  const json = async (path: string) => (await (await request.get(`${API}${path}`, { headers: await admin(request) })).json()).data.items as { id?: string; roleId?: string; name: string; isHighest?: boolean }[];
  const dept = (await json('/masters/departments'))[0];
  const desig = (await json('/masters/designations')).find((d) => !d.isHighest) ?? (await json('/masters/designations'))[0];
  const role = (await json('/roles')).find((r) => r.name === 'Initiator')!;
  const res = await request.post(`${API}/users`, {
    headers: { ...(await admin(request)), 'Idempotency-Key': `it-adm-lgn-${code}` },
    data: { employeeCode: code, fullName: `IT Login ${code}`, email: `itlogin${code}@example.invalid`, departmentId: dept.id, designationId: desig.id, reportingManagerCode: '10001', signIn: 'LOCAL', companies: [{ companyCode: 'IPL', roleIds: [role.roleId], validFrom: '2026-01-01' }] },
  });
  expect(res.status()).toBe(201);
  execSync(`${DB} "update users set password_hash = '${HASH}' where employee_code = '${code}'"`);
  created.push(code);
  return code;
}

test.describe('QA engineer verifies sign-in end to end with the Administrator module (US-LGN01-009)', () => {
  test.afterAll(async ({ request }) => {
    for (const code of created) await request.post(`${API}/users/${code}/deactivate`, { headers: await admin(request), data: { reason: 'OTHER', note: 'End of the integration journey' } });
    removeMadeUsers();
  });

  /** @tc TC-LGN01-009-E01 @story US-LGN01-009 @ac AC-US-LGN01-009-01 @subtask ST-LGN01-009-IN-02 */
  test('TC-LGN01-009-E01 a user the Administrator created signs in in the browser and reaches the next step', async ({ page, request }) => {
    const code = await adminCreates(request);
    await page.goto('/login');
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL('**/choose-password');
    await shot(page, 'TC-LGN01-009-E01_next-step');
  });

  /** @tc TC-LGN01-009-E02 @story US-LGN01-009 @ac AC-US-LGN01-009-02 @subtask ST-LGN01-009-IN-02 */
  test('TC-LGN01-009-E02 a locked user is unlocked by the Administrator and can sign in', async ({ page, request }) => {
    const code = await adminCreates(request);
    await page.goto('/login');
    for (let i = 0; i < 5; i++) await submitPassword(page, code, `wrong-${i}`);
    await expect(tid(page, 'sign-in-error')).toContainText(/locked/i);
    await shot(page, 'TC-LGN01-009-E02_locked');
    expect((await request.post(`${API}/users/${code}/unlock`, { headers: await admin(request) })).status()).toBe(200);
    await submitPassword(page, code, PASSWORD);
    await page.waitForURL('**/choose-password');
    await shot(page, 'TC-LGN01-009-E02_after-unlock');
  });
});
