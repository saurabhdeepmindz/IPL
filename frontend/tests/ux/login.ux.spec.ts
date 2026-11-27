/**
 * @file    login.ux.spec.ts
 * @module  Tests (UX fidelity)
 *
 * @description
 * Pixel comparison of the Login screens with the high-fidelity (HF) mock-up: LGN-01 (sign-in and its error, locked and inactive states), LGN-02 (single sign-on states) and, from R14, LGN-04 and LGN-05 (forgot password, check your e-mail) LGN-06 and LGN-07 (set a new password, changed, link expired) and LGN-08 (change the temporary password). In plain words: for each screen the HF page and the
 * application are opened at the same size and state, photographed, and the pictures are compared pixel by pixel; the pictures are kept as proof.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic       EPIC-LGN-01, EPIC-LGN-02
 * @story      US-LGN01-005, US-LGN01-006, US-LGN01-007, US-LGN02-006, US-LGN02-007, US-LGN02-008
 * @workflow   UF-01
 * @tc         UX-LGN-01, UX-LGN-02, UX-LGN-04, UX-LGN-05, UX-LGN-06, UX-LGN-07, UX-LGN-08
 * @lld            LLD-EPIC-LGN-01 v0.5 §15
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/ux/login.ux.spec.ts
 * @lld-synced     v0.5
 * @status     built
 */
import { expect, test, type Page } from '@playwright/test';
import { compareScreen, type UxScreen } from './ux-compare';

const BASE = 'http://localhost:3001';
const CONFIG = { ssoAvailable: true, idpMode: 'saml', helpdesk: { phone: '+91 00000 00000', email: 'it.helpdesk@ipl.example', hours: 'Mon–Sat, 9:00–18:00', placeholder: true } };
const json = (body: unknown, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) });
const LOCKED_UNTIL = new Date(2026, 10, 26, 10, 15, 0).toISOString();

async function mockConfig(page: Page) {
  await page.route('**/auth/public-config', (r) => r.fulfill(json({ data: CONFIG })));
}

// UX-LGN-05: the HF page has a shortcut "Open the link from the e-mail (demo)" that is part of the mock-up, not of the product; it is removed from the HF picture.
async function dropDemoLink(page: Page) {
  await page.locator('a[href*="HF-LGN-06"]').evaluate((a) => a.remove());
}

const LINK_OK = { data: { valid: true, maskedEmail: 'k.***@ipl.example' } };

async function openSetPassword(page: Page, answer: { status: number; body: unknown }) {
  await mockConfig(page);
  await page.route('**/auth/password/reset/*', (r) => r.fulfill(json(answer.body, answer.status)));
}

async function changePassword(page: Page) {
  await page.route('**/auth/password/reset', (r) => r.fulfill(json({ data: { done: true } })));
  await page.locator('#np').fill('Good-pass-1');
  await page.locator('#cp').fill('Good-pass-1');
  await Promise.all([page.waitForResponse('**/auth/password/reset'), page.getByTestId('set-submit').click()]);
}

// UX-LGN-06: the HF shows "Change password" enabled and checks on submit; the agreed criterion keeps it off until all rules are met. The button (#go, same id in both) is painted grey until IPL decides.
// UX-LGN-02 and UX-LGN-03: the app leaves out the line "For A. Kumar (10002)." (it needs a token-check call that shows the name) and the sentence about a confirmation e-mail (no story).
// The same words are taken out of the HF picture, so both pictures hold the same text.
async function dropNameLine(page: Page) {
  await page.locator('#who').evaluate((b) => {
    const p = b.parentElement as HTMLElement;
    p.textContent = 'Choose a password you have not used before.';
  });
}

async function dropConfirmationSentence(page: Page) {
  await page.locator('#v-done .sub').evaluate((p) => {
    p.textContent = 'Your new password works from now on. For safety, you have been signed out of AMS on other devices.';
  });
}

// UX-LGN-04: the sign-in answer carries the employee code but not the name (the name comes from "Who am I", EPIC-LGN-04). The app shows the code only; the HF picture gets the same words
// (code on the first line, "Employee code" on the second) and the avatar circle is painted grey. The demo line "Demo: Temp#4821" is part of the mock-up and is taken out of the HF picture.
async function useChipOfApp(page: Page) {
  await page.locator('#wn').evaluate((b) => { b.textContent = '10002'; });
  await page.locator('#wd').evaluate((s) => { s.textContent = 'Employee code'; });
  await page.locator('#tp').evaluate((input) => {
    const help = input.closest('.field')?.querySelector('.help');
    help?.querySelector('code')?.remove();
    if (help?.lastChild) help.lastChild.textContent = (help.lastChild.textContent ?? '').replace(' Demo: ', '');
  });
}

/** Signs in with a temporary password (the answer is stubbed) so the application opens /choose-password by its own redirect, with the session in memory. */
async function signInWithTemporaryPassword(page: Page) {
  await page.route('**/auth/sign-in', (r) => r.fulfill(json({ data: { nextStep: 'CHANGE_PASSWORD', user: { employeeCode: '10002', name: 'A. Kumar' }, accessToken: 'tok-temp', expiresIn: 900 } })));
  await page.locator('#code').fill('10002');
  await page.locator('#pw').fill('Temp#4821');
  await page.getByTestId('sign-in-submit').click();
  await page.waitForURL('**/choose-password');
}

async function askForLink(page: Page) {
  await page.route('**/auth/password/forgot', (r) => r.fulfill(json({ data: { message: 'x', retryAfterSeconds: 60 } }, 202)));
  await page.locator('#code').fill('10002');
  await page.locator('#mail').fill('k.rao@ipl.example');
  await Promise.all([page.waitForResponse('**/auth/password/forgot'), page.getByTestId('forgot-submit').click()]);
}

async function failSignIn(page: Page, status: number, details: Record<string, unknown>, code: string) {
  await page.route('**/auth/sign-in', (r) => r.fulfill(json({ error: { code, message: 'x', fields: [], details } }, status)));
  await page.locator('#code').fill('10002');
  await page.locator('#pw').fill('Wrong-pass-1');
  await Promise.all([page.waitForResponse('**/auth/sign-in'), page.getByTestId('sign-in-submit').click()]);
}

const SCREENS: UxScreen[] = [
  { id: 'UX-LGN-01-sign-in', hf: { file: '01-Login-User-Flow/HF-LGN-01-sign-in.html' }, app: { url: '/login', prepare: mockConfig } },
  {
    id: 'UX-LGN-01-wrong-password',
    hf: { file: '01-Login-User-Flow/HF-LGN-01-sign-in.html', suffix: '#error' },
    app: { url: '/login', prepare: mockConfig, steps: (p) => failSignIn(p, 401, { attemptsLeft: 4 }, 'INVALID_CREDENTIALS').then(() => p.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())) },
  },
  {
    id: 'UX-LGN-01-locked',
    hf: { file: '01-Login-User-Flow/HF-LGN-01-sign-in.html', suffix: '#locked' },
    app: { url: '/login', prepare: mockConfig, steps: (p) => failSignIn(p, 423, { lockedUntil: LOCKED_UNTIL, reference: 'LCK-10002' }, 'ACCOUNT_LOCKED') },
  },
  {
    id: 'UX-LGN-01-inactive',
    hf: { file: '01-Login-User-Flow/HF-LGN-01-sign-in.html', suffix: '#inactive' },
    app: { url: '/login', prepare: mockConfig, steps: (p) => failSignIn(p, 403, { reference: 'INA-10002' }, 'ACCOUNT_INACTIVE') },
  },
  { id: 'UX-LGN-02-signing-in', hf: { file: '01-Login-User-Flow/HF-LGN-02-sso.html', suffix: '#redirect' }, app: { url: '/signing-in', prepare: mockConfig } },
  { id: 'UX-LGN-02-failed', hf: { file: '01-Login-User-Flow/HF-LGN-02-sso.html', suffix: '#failed' }, app: { url: '/signing-in?state=failed&ref=SSO-1F9A-1000', prepare: mockConfig }, mask: ['#c1 .hf-mono,.hf-contact .hf-mono'] },
  { id: 'UX-LGN-02-noaccount', hf: { file: '01-Login-User-Flow/HF-LGN-02-sso.html', suffix: '#noaccount' }, app: { url: '/signing-in?state=noaccount&ref=USR-S.KRISHNAN&who=s.krishnan%40ipl.example', prepare: mockConfig } },
  { id: 'UX-LGN-02-cancelled', hf: { file: '01-Login-User-Flow/HF-LGN-02-sso.html', suffix: '#denied' }, app: { url: '/signing-in?state=cancelled&ref=SSO-1F9A-1000', prepare: mockConfig }, mask: ['.hf-contact .hf-mono'] },
  { id: 'UX-LGN-04-request', hf: { file: '01-Login-User-Flow/HF-LGN-04-forgot-password.html' }, app: { url: '/forgot-password', prepare: mockConfig } },
  // UX-LGN-01: the HF shows 3 characters of the address, the agreed rule shows 2. The masked address (#mk, same id in both) is painted grey until IPL decides.
  { id: 'UX-LGN-05-sent', hf: { file: '01-Login-User-Flow/HF-LGN-04-forgot-password.html', suffix: '#sent', steps: dropDemoLink }, app: { url: '/forgot-password', prepare: mockConfig, steps: askForLink }, mask: ['#mk'] },
  { id: 'UX-LGN-06-set', hf: { file: '01-Login-User-Flow/HF-LGN-06-reset-password.html', suffix: '#set', steps: dropNameLine }, app: { url: '/set-password?token=tok-1', prepare: (p) => openSetPassword(p, { status: 200, body: LINK_OK }) }, mask: ['#go'] },
  { id: 'UX-LGN-07-done', hf: { file: '01-Login-User-Flow/HF-LGN-06-reset-password.html', suffix: '#done', steps: dropConfirmationSentence }, app: { url: '/set-password?token=tok-1', prepare: (p) => openSetPassword(p, { status: 200, body: LINK_OK }), steps: changePassword } },
  { id: 'UX-LGN-06-expired', hf: { file: '01-Login-User-Flow/HF-LGN-06-reset-password.html', suffix: '#expired' }, app: { url: '/set-password?token=old', prepare: (p) => openSetPassword(p, { status: 410, body: { error: { code: 'LINK_EXPIRED', message: 'x', fields: [], details: {} } } }) } },
  { id: 'UX-LGN-08-change', hf: { file: '01-Login-User-Flow/HF-LGN-08-change-temporary-password.html', steps: useChipOfApp }, app: { url: '/login', prepare: mockConfig, steps: signInWithTemporaryPassword }, mask: ['#av'] },
  { id: 'UX-LGN-01-sign-in-mobile', hf: { file: '01-Login-User-Flow/HF-LGN-01-sign-in.html' }, app: { url: '/login', prepare: mockConfig }, viewport: { width: 390, height: 844 } },
];

test.describe('UX fidelity: Login screens against the high-fidelity design', () => {
  for (const s of SCREENS) {
    test(s.id, async ({ browser }) => {
      const r = await compareScreen(browser, BASE, s);
      console.warn(`${r.id}: ${r.passed ? 'PASS' : 'FAIL'} size HF ${r.hfSize.join('x')} app ${r.appSize.join('x')} diff ${r.diffPixels} px (${(r.ratio * 100).toFixed(2)} %)`);
      expect(r.sameSize, `page size HF ${r.hfSize} vs app ${r.appSize}`).toBe(true);
      expect(r.ratio, `${r.diffPixels} of ${r.totalPixels} pixels differ`).toBeLessThanOrEqual(s.maxDiffRatio ?? 0.005);
    });
  }
});
