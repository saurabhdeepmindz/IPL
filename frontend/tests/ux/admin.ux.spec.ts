/**
 * @file    admin.ux.spec.ts
 * @module  Tests (UX fidelity)
 *
 * @description
 * Pixel comparison of the Administration screens with the high-fidelity (HF) mock-up. In plain words: for each screen the HF page and the application are opened at the same size and in the same state, the application is fed
 * the same demo rows the HF page shows (read from the HF page itself, API answers mocked), both are photographed and the pictures are compared pixel by pixel.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic       EPIC-ADM-01
 * @story      US-ADM01-001
 * @workflow   AD-02
 * @tc         UX-ADM-01
 * @status     built
 */
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { compareScreen, HF_ROOT, type UxScreen } from './ux-compare';

const BASE = 'http://localhost:3001';
const MONTHS: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const json = (body: unknown, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) });

/** Signs the browser in as the HF demo Administrator without calling the API: the marker cookie and the stored user. */
async function signedIn(page: Page, context: BrowserContext) {
  await context.addCookies([{ name: 'ams_session', value: '1', url: BASE }]);
  await page.addInitScript(() => {
    sessionStorage.setItem('ams-session', JSON.stringify({ state: { status: 'signedIn', user: { userId: 'u1', employeeCode: '10002', name: 'A. Kumar', team: 'IT team', companyCode: '1000' } }, version: 0 }));
  });
}

interface HfRow {
  code: string; name: string; email: string; dept: string; desig: string; roles: { code: string; roles: string[] }[]; signIn: string; status: string; last: string;
}

/** Reads the demo rows, counts and filter lists from the HF page (the page builds them with its own script). */
async function readHfUsers(context: BrowserContext) {
  const browser = context.browser()!;
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto(`file:///${HF_ROOT.replace(/\\/g, '/')}/02-Admin/HF-ADM-01-user-management.html`);
  await p.waitForTimeout(600);
  const data = await p.evaluate(() => {
    const t = (e: Element | null | undefined) => (e?.textContent ?? '').trim();
    const rows = [...document.querySelectorAll('#uBody tr')].map((tr) => {
      const td = tr.querySelectorAll('td');
      return {
        code: t(td[0]), name: t(td[1].querySelector('b')), email: t(td[1].querySelector('small')),
        dept: (td[2].childNodes[0]?.textContent ?? '').trim(), desig: t(td[2].querySelector('small')),
        roles: [...td[3].querySelectorAll('.chip')].map((ch) => ({ code: t(ch.querySelector('b')), roles: (ch.textContent ?? '').replace(t(ch.querySelector('b')), '').replace(/[ ·]/g, ' ').trim().split(/,\s*/) })),
        signIn: t(td[4].querySelector('.badge')), status: t(td[5].querySelector('.badge')), last: t(td[5].querySelector('small')).replace('Last sign-in:', '').trim(),
      };
    });
    const opts = (id: string) => [...document.querySelectorAll(`#${id} option`)].slice(1).map((o) => t(o));
    return { rows, counts: { all: +t(document.getElementById('c-all')), active: +t(document.getElementById('c-act')), inactive: +t(document.getElementById('c-ina')), locked: +t(document.getElementById('c-lck')) }, depts: opts('fDept'), roles: opts('fRole') };
  });
  await c.close();
  return data as { rows: HfRow[]; counts: { all: number; active: number; inactive: number; locked: number }; depts: string[]; roles: string[] };
}

function lastIso(label: string): string | null {
  if (label === 'Never') return null;
  const today = label.match(/^Today (\d\d):(\d\d)$/);
  if (today) return new Date(2026, 10, 26, +today[1], +today[2]).toISOString();
  if (label === 'Yesterday') return new Date(2026, 10, 25, 12, 0).toISOString();
  const d = label.match(/^(\d\d)-(\w{3})-(\d{4})$/);
  return d ? new Date(+d[3], MONTHS[d[2]], +d[1], 12, 0).toISOString() : null;
}

async function mockUsersApi(page: Page, context: BrowserContext) {
  await signedIn(page, context);
  const hf = await readHfUsers(context);
  const items = hf.rows.map((r) => ({
    employeeCode: r.code, name: r.name, email: r.email, department: r.dept, designation: r.desig, companies: r.roles.filter((x) => x.code).map((x) => ({ code: x.code, roles: x.roles })),
    signIn: r.signIn === 'SSO' ? 'SSO' : 'LOCAL', status: r.status.toUpperCase(), lastSignIn: lastIso(r.last),
  }));
  await page.route(/\/api\/v1\/users(\?.*)?$/, (r) => r.fulfill(json({ data: { items, counts: hf.counts, page: 1, pageSize: 10, total: hf.counts.all } })));
  await page.route('**/masters/departments', (r) => r.fulfill(json({ data: { items: hf.depts.map((n) => ({ id: n, code: n, name: n })) } })));
  await page.route('**/masters/companies', (r) => r.fulfill(json({ data: { items: [{ code: '1000', name: 'Indian Potash Limited' }, { code: '2000', name: 'IPL Subsidiary' }], canViewAll: false } })));
  await page.route(/\/api\/v1\/roles(\?.*)?$/, (r) => r.fulfill(json({ data: { items: hf.roles.map((n) => ({ roleId: n, name: n, description: '', type: 'STANDARD', userCount: 0, lastChanged: '2026-01-01T00:00:00Z', status: 'ACTIVE' })) } })));
}

// Parts that cannot match yet are painted grey in both pictures, each with its reason:
//  - the notification bell and its count: the notification module is not built (ADM-A2)
//  - the Company filter's closed text: the HF shows "All companies", the application keeps the honest "Current company" (decision UX-ACC-01)
const MASK_SHELL = ['.bell,.hf-bell'];

/** Reads the demo roles from the HF role page and mocks the role list API with them. */
async function mockRolesApi(page: Page, context: BrowserContext) {
  await signedIn(page, context);
  const browser = context.browser()!;
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto(`file:///${HF_ROOT.replace(/\\/g, '/')}/02-Admin/HF-ADM-02-role-management.html`);
  await p.waitForTimeout(600);
  const hfRoles = await p.evaluate(() => {
    const t = (e: Element | null | undefined) => (e?.textContent ?? '').trim();
    return [...document.querySelectorAll('#rBody tr')].map((tr) => {
      const td = tr.querySelectorAll('td');
      return { name: t(td[0].querySelector('a')), description: t(td[0].querySelector('small')), allows: t(td[1]), type: t(td[2]), users: +t(td[3]), changed: t(td[4]), status: t(td[5]) };
    });
  });
  await c.close();
  const items = hfRoles.map((r, i) => {
    const m = r.changed.match(/^(\d\d)-(\w{3})-(\d{4})$/)!;
    return {
      roleId: `r${i}`, name: r.name, description: r.description, type: r.type.toUpperCase(), userCount: r.users, lastChanged: new Date(+m[3], MONTHS[m[2]], +m[1], 12, 0).toISOString(), status: r.status.toUpperCase(),
      allowsSummary: r.allows.split(/\s*·\s*/).map((x) => x.trim()).filter(Boolean),
    };
  });
  await page.route(/\/api\/v1\/roles(\?.*)?$/, (r) => r.fulfill(json({ data: { items } })));
  await page.route('**/masters/companies', (r) => r.fulfill(json({ data: { items: [{ code: '1000', name: 'Indian Potash Limited' }, { code: '2000', name: 'IPL Subsidiary' }], canViewAll: false } })));
}

/** Mocks the role form: the role list, the permission catalogue read from the HF form (modules, permissions, scoped ones) and the companies. */
async function mockRoleFormApi(page: Page, context: BrowserContext) {
  await mockRolesApi(page, context);
  const browser = context.browser()!;
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto(`file:///${HF_ROOT.replace(/\\/g, '/')}/02-Admin/HF-ADM-02-role-management.html#new`);
  await p.waitForTimeout(600);
  const mods = await p.evaluate(() => {
    const t = (e: Element | null | undefined) => (e?.textContent ?? '').trim();
    return [...document.querySelectorAll('#permBox .perm-mod')].map((m) => ({
      module: t(m.querySelector('header b')), note: t(m.querySelector('header .badge')),
      permissions: [...m.querySelectorAll('.pl .perm')].map((pm, i) => ({ label: (pm.querySelector('span')?.childNodes[0]?.textContent ?? '').trim(), hint: t(pm.querySelector('span small')), scoped: !!pm.querySelector('select'), key: `${t(m.querySelector('header b'))}.${i}` })),
    }));
  });
  await c.close();
  const groups = mods.map((m) => ({ ...m, permissions: m.permissions.map((q) => ({ key: q.key, label: q.label, hint: q.hint, cells: { r0: { allowed: false, scope: q.scoped ? 'COMPANY' : null, locked: false } } })) }));
  await page.route('**/roles/permissions/matrix', (r) => r.fulfill(json({ data: { groups, roles: [{ roleId: 'r0' }] } })));
  return groups;
}

/** Mocks the role details: the HF "Processor" view read from the HF page (users, what it allows, facts) on top of the form mocks. */
async function mockRoleViewApi(page: Page, context: BrowserContext) {
  const groups = await mockRoleFormApi(page, context);
  const keyOf = new Map(groups.flatMap((g) => g.permissions.map((q) => [q.label, q.key] as const)));
  const browser = context.browser()!;
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto(`file:///${HF_ROOT.replace(/\\/g, '/')}/02-Admin/HF-ADM-02-role-management.html#view/processor`);
  await p.waitForTimeout(600);
  const v = await p.evaluate(() => {
    const t = (e: Element | null | undefined) => (e?.textContent ?? '').trim();
    return {
      name: t(document.querySelector('#vName')), desc: t(document.querySelector('#vDesc')),
      users: [...document.querySelectorAll('#uBody tr')].map((tr) => { const td = tr.querySelectorAll('td'); return { name: t(td[0].querySelector('b')), code: t(td[0].querySelector('small')), dept: t(td[1]), company: t(td[2]), since: t(td[3]) }; }),
      allows: [...document.querySelectorAll('#vSum li')].filter((li) => li.querySelector('svg')).map((li) => ({ label: t(li.querySelector('span')).split(' — ')[0], scope: t(li.querySelector('b')) })),
      changed: t(document.querySelectorAll('#vDl dd')[3]),
    };
  });
  await c.close();
  const day = (label: string) => { const m = label.match(/^(\d\d)-(\w{3})-(\d{4})/)!; return new Date(+m[3], MONTHS[m[2]], +m[1], 12, 0).toISOString(); };
  const scope = (x: string) => ({ 'own only': 'OWN', 'own department': 'DEPARTMENT', 'whole company': 'COMPANY' })[x] ?? null;
  const [changedDay, changedBy] = v.changed.split(' · ');
  const role = {
    roleId: 'r1', name: v.name, description: v.desc, type: 'STANDARD', userCount: 96, lastChanged: day(changedDay), changedBy, status: 'ACTIVE',
    users: v.users.map((u) => { const [companyName, code] = u.company.split(' · '); return { employeeCode: u.code, name: u.name, department: u.dept, company: code, companyName, assignedOn: day(u.since) }; }),
    allows: v.allows.map((a) => ({ permission: keyOf.get(a.label) ?? a.label, scope: scope(a.scope) })),
  };
  await page.route(/\/api\/v1\/roles\/r1$/, (r) => r.fulfill(json({ data: role })));
}

const SCREENS: UxScreen[] = [
  {
    id: 'UX-ADM-01-user-list',
    hf: { file: '02-Admin/HF-ADM-01-user-management.html' },
    app: { url: '/users', prepare: mockUsersApi, steps: (p) => p.getByTestId('users-table').waitFor() },
    mask: [...MASK_SHELL, '#fCo,[aria-label="Company"]'],
  },
  {
    id: 'UX-ADM-02-role-list',
    hf: { file: '02-Admin/HF-ADM-02-role-management.html' },
    app: { url: '/roles', prepare: mockRolesApi, steps: (p) => p.getByTestId('roles-table').waitFor() },
    mask: MASK_SHELL,
  },
  {
    id: 'UX-ADM-02-role-form',
    hf: { file: '02-Admin/HF-ADM-02-role-management.html', suffix: '#new' },
    app: { url: '/roles/new', prepare: async (p, c) => { await mockRoleFormApi(p, c); }, steps: (p) => p.getByTestId('roles-switches').waitFor() },
    mask: MASK_SHELL,
  },
  {
    id: 'UX-ADM-02-role-view',
    hf: { file: '02-Admin/HF-ADM-02-role-management.html', suffix: '#view/processor' },
    app: { url: '/roles/r1', prepare: mockRoleViewApi, steps: (p) => p.getByTestId('roles-users-table').waitFor() },
    // The "Remove" buttons of the design (unassign from this screen) are not in the stories (decision UX-ACC-05): the action column is painted grey.
    // The role name in the breadcrumb comes from the loaded role (the page passes a fixed label today): painted grey.
    mask: [...MASK_SHELL, '#uTbl td.act,#uTbl th.act,.hf-tbl td.hf-act,.hf-tbl th.hf-act', '.crumbs .cur,.hf-crumbs .hf-cur'],
  },
];

test.describe('UX fidelity: Administration screens against the high-fidelity design', () => {
  for (const s of SCREENS) {
    test(s.id, async ({ browser }) => {
      const r = await compareScreen(browser, BASE, s);
      console.warn(`${r.id}: ${r.passed ? 'PASS' : 'FAIL'} size HF ${r.hfSize.join('x')} app ${r.appSize.join('x')} diff ${r.diffPixels} px (${(r.ratio * 100).toFixed(2)} %)`);
      expect(r.sameSize, `page size HF ${r.hfSize} vs app ${r.appSize}`).toBe(true);
      expect(r.ratio, `${r.diffPixels} of ${r.totalPixels} pixels differ`).toBeLessThanOrEqual(s.maxDiffRatio ?? 0.005);
    });
  }
});
