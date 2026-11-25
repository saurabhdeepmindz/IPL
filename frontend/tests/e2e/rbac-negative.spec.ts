/**
 * @file    rbac-negative.spec.ts
 * @module  Tests
 *
 * @description
 * Playwright cases of the screens of the RBAC negative pack. In plain words: each of the six roles opens the five screens; a screen the role must not reach shows the no-access view.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-018
 * @subtask        ST-ADM01-018-IN-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.9
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/e2e/rbac-negative.spec.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3100/api/v1';
const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
const OUT = process.env.RBAC_OUT ?? 'rbac-out';
const SIX_ROLES = ['Administrator', 'Initiator', 'Processor', 'Finance', 'Report Viewer', 'Auditor'];
const base = 70000 + (Date.now() % 2500) * 10;

type Matrix = { roles: { roleId: string; name: string }[]; groups: { permissions: { key: string; cells: Record<string, { allowed: boolean }> }[] }[] };
type Screen = { name: string; permission: 'users.view' | 'roles.view'; open: (page: Page, ctx: Ctx) => Promise<void>; heading: (page: Page, ctx: Ctx) => ReturnType<Page['locator']>; denied: string };
type Ctx = { initiatorRoleId: string };

const bearer = async (request: APIRequestContext) => ({ Authorization: `Bearer ${(await (await request.post(`${API}/dev/sign-in`, { data: { employeeCode: '10001', companyCode: 'IPL' } })).json()).data.accessToken as string}` });
const cellAllowed = (m: Matrix, role: string, key: string): boolean => {
  const roleId = m.roles.find((r) => r.name === role)!.roleId;
  return Boolean(m.groups.flatMap((g) => g.permissions).find((p) => p.key === key)!.cells[roleId].allowed);
};

/** Moves to another screen without a page reload (the sign-in lives in memory). */
const pushTo = (page: Page, url: string) => page.evaluate((u) => (window as unknown as { next: { router: { push: (x: string) => void } } }).next.router.push(u), url);
const visible = (page: Page, testId: string) => page.getByTestId(testId).filter({ visible: true });

const SCREENS: Screen[] = [
  { name: 'User Management', permission: 'users.view', open: async (p) => { await p.getByRole('link', { name: 'User Management' }).click(); }, heading: (p) => p.getByRole('heading', { name: 'User Management' }), denied: 'You do not have access to User Management.' },
  { name: 'user details', permission: 'users.view', open: async (p) => { await pushTo(p, '/users/10001'); }, heading: (p) => p.getByTestId('user-detail').filter({ visible: true }), denied: 'You do not have access to user details.' },
  { name: 'Role Management', permission: 'roles.view', open: async (p) => { await p.getByRole('link', { name: 'Role Management' }).click(); }, heading: (p) => p.getByRole('heading', { name: 'Role Management' }), denied: 'You do not have access to Role Management.' },
  { name: 'role details', permission: 'roles.view', open: async (p, c) => { await pushTo(p, `/roles/${c.initiatorRoleId}`); }, heading: (p) => p.getByTestId('roles-detail').filter({ visible: true }), denied: 'You do not have access to role details.' },
  { name: 'Permission Management', permission: 'roles.view', open: async (p) => { await p.getByRole('link', { name: 'Permission Management' }).click(); }, heading: (p) => p.getByRole('heading', { name: 'Permission Management' }), denied: 'You do not have access to Permission Management.' },
];

const results: { role: string; screen: string; permission: string; expected: 'opens' | 'no-access'; passed: boolean }[] = [];
const codes: Record<string, string> = {};
let matrix: Matrix;
let ctx: Ctx;

test.describe.configure({ mode: 'serial' });

test.describe('RBAC negative pack: screens (story 018)', () => {
  test.beforeAll(async ({ request }) => {
    const auth = await bearer(request);
    matrix = (await (await request.get(`${API}/roles/permissions/matrix`, { headers: auth })).json()).data as Matrix;
    ctx = { initiatorRoleId: matrix.roles.find((r) => r.name === 'Initiator')!.roleId };
    const dept = (await (await request.get(`${API}/masters/departments`, { headers: auth })).json()).data.items[0].id as string;
    const desig = ((await (await request.get(`${API}/masters/designations`, { headers: auth })).json()).data.items as { id: string; isHighest?: boolean }[]).find((d) => !d.isHighest)!.id;
    for (const [i, role] of SIX_ROLES.entries()) {
      const code = String(base + i);
      const res = await request.post(`${API}/users`, {
        headers: { ...auth, 'Idempotency-Key': `rbac-${code}` },
        data: { employeeCode: code, fullName: `RBAC ${role}`, email: `rbac${code}@example.invalid`, departmentId: dept, designationId: desig, reportingManagerCode: '10001', signIn: 'SSO', companies: [{ companyCode: 'IPL', roleIds: [matrix.roles.find((r) => r.name === role)!.roleId], validFrom: '2026-01-01' }] },
      });
      expect(res.status(), `making the test user of ${role}`).toBe(201);
      codes[role] = code;
    }
  });

  test.afterAll(async ({ request }) => {
    const auth = await bearer(request);
    for (const code of Object.values(codes)) await request.post(`${API}/users/${code}/deactivate`, { headers: auth, data: { reason: 'OTHER', note: 'End of the RBAC run' } });
    mkdirSync(OUT, { recursive: true });
    writeFileSync(`${OUT}/rbac-screens.json`, JSON.stringify({ cases: results }, null, 1));
  });

  for (const role of SIX_ROLES) {
    for (const screen of SCREENS) {
      /**
       * @tc        TC-ADM01-018-E01
       * @story     US-ADM01-018
       * @ac        AC-US018-01
       * @subtask   ST-ADM01-018-IN-02
       * In plain words: the role signs in and opens the screen; the matrix decides whether the screen opens or shows "You do not have access".
       */
      test(`${role} · ${screen.name}`, async ({ page }) => {
        const allowed = cellAllowed(matrix, role, screen.permission);
        const entry = { role, screen: screen.name, permission: screen.permission, expected: (allowed ? 'opens' : 'no-access') as 'opens' | 'no-access', passed: false };
        results.push(entry);
        await page.goto('/login');
        await page.getByLabel(/Employee code/).fill(codes[role]);
        await page.getByLabel(/Company/).fill('IPL');
        await page.getByRole('button', { name: 'Sign in' }).click();
        await page.waitForURL('**/roles');
        await screen.open(page, ctx);
        if (allowed) {
          await expect(screen.heading(page, ctx)).toBeVisible();
          await expect(page.getByText(/^Loading/).filter({ visible: true })).toHaveCount(0);
          await expect(visible(page, 'no-access')).toHaveCount(0);
        }
        else {
          await expect(visible(page, 'no-access')).toHaveText(screen.denied);
          await expect(page.getByText(/could not be loaded/)).toHaveCount(0);
        }
        await page.screenshot({ path: `${SHOTS}/TC-ADM01-018-E01_${role.replace(/ /g, '-')}_${screen.name.replace(/ /g, '-')}.png`, fullPage: true });
        entry.passed = true;
      });
    }
  }
});
