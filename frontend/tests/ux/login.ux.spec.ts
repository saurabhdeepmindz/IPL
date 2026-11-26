/**
 * @file    login.ux.spec.ts
 * @module  Tests (UX fidelity)
 *
 * @description
 * Pixel comparison of the Login screens with the high-fidelity (HF) mock-up: LGN-01 (sign-in and its error, locked and inactive states) and LGN-02 (single sign-on states). In plain words: for each screen the HF page and the
 * application are opened at the same size and state, photographed, and the pictures are compared pixel by pixel; the pictures are kept as proof.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic       EPIC-LGN-01
 * @story      US-LGN01-005, US-LGN01-006, US-LGN01-007
 * @workflow   UF-01
 * @tc         UX-LGN-01, UX-LGN-02
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
