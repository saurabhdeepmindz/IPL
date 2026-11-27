/**
 * @file    ux-compare.ts
 * @module  Tests (UX fidelity)
 *
 * @description
 * Pixel comparison of a high-fidelity (HF) mock-up screen with the same screen of the application. In plain words: opens the HF page and the app page at the same size, takes a full-page picture of each,
 * counts the pixels that differ, writes the three pictures (HF, app, difference) and fails when more pixels differ than the screen allows.
 *
 * Copy this file to `<frontend>/tests/ux/ux-compare.ts`. It needs `@playwright/test` and `pngjs` (a dependency of Playwright; add it as a dev dependency if the project lists dependencies strictly).
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import type { Browser, BrowserContext, Page } from '@playwright/test';

export interface UxScreen {
  /** Test-case id, for example UX-LGN-01-sign-in. Also the folder name of the pictures. */
  id: string;
  /** The HF page: file below HF_ROOT, an optional `#state` hash or `?query`, and optional steps to bring it into the state (click, type). */
  hf: { file: string; suffix?: string; steps?: (page: Page) => Promise<void> };
  /** The application page: the address and the steps that bring it into the same state (mock the API, type, click). */
  app: { url: string; prepare?: (page: Page, context: BrowserContext) => Promise<void>; steps?: (page: Page) => Promise<void> };
  /** Browser size. Default 1440 x 900. */
  viewport?: { width: number; height: number };
  /** Largest share of differing pixels that still passes. Default 0.005 (0.5 %). */
  maxDiffRatio?: number;
  /** A pixel differs when any colour channel differs by more than this (0 to 255). Default 24: hides font anti-aliasing noise, not a wrong colour or position. */
  channelTolerance?: number;
  /** Selectors painted solid grey in both pictures (dynamic text such as a clock). Keep this list short and explain each entry in the test. */
  mask?: string[];
  /** Reason shown in the report when a known gap is accepted by the user (id of the decision). Not set means every difference counts. */
  accepted?: string;
}

export interface UxResult {
  id: string;
  hfSize: [number, number];
  appSize: [number, number];
  sameSize: boolean;
  diffPixels: number;
  totalPixels: number;
  ratio: number;
  passed: boolean;
  files: { hf: string; app: string; diff: string };
}

export const HF_ROOT = process.env.HF_ROOT ?? path.resolve(__dirname, '../../../../../SOW-HTML/HighFidelityMockups');
const OUT = process.env.UX_OUT ?? 'test-results/ux';
const NO_MOTION = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}';
/** Parts of the HF pages that belong to the mock-up and not to the product. */
const HF_ONLY = '.proto,.demo,#toasts,.toast-stack{display:none!important}';

async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function paintMasks(page: Page, masks: string[] | undefined): Promise<void> {
  if (!masks?.length) return;
  await page.addStyleTag({ content: masks.flatMap((entry) => entry.split(',').map((x) => x.trim()).filter(Boolean)).map((m) => `${m}{background:#888!important;color:#888!important;border-color:#888!important;opacity:1!important}${m} *{background:#888!important;color:#888!important;border-color:#888!important}`).join('\n') });
}

/** Takes the picture of the HF page. */
async function shootHf(browser: Browser, s: UxScreen, fixedTime: Date): Promise<Buffer> {
  const context = await browser.newContext({ viewport: s.viewport ?? { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.clock.setFixedTime(fixedTime);
  await page.addInitScript(() => {
    Math.random = () => 0.123456;
  });
  const url = `file:///${path.join(HF_ROOT, s.hf.file).replace(/\\/g, '/')}${s.hf.suffix ?? ''}`;
  await page.goto(url);
  await page.addStyleTag({ content: NO_MOTION + HF_ONLY });
  await s.hf.steps?.(page);
  await settle(page);
  await paintMasks(page, s.mask);
  const png = await page.screenshot({ fullPage: true });
  await context.close();
  return png;
}

/** Takes the picture of the application page. */
async function shootApp(browser: Browser, baseURL: string, s: UxScreen, fixedTime: Date): Promise<Buffer> {
  const context = await browser.newContext({ viewport: s.viewport ?? { width: 1440, height: 900 }, deviceScaleFactor: 1, baseURL });
  const page = await context.newPage();
  await page.clock.setFixedTime(fixedTime);
  await s.app.prepare?.(page, context);
  await page.goto(s.app.url);
  await page.addStyleTag({ content: NO_MOTION });
  await s.app.steps?.(page);
  await settle(page);
  await paintMasks(page, s.mask);
  const png = await page.screenshot({ fullPage: true });
  await context.close();
  return png;
}

/** Counts differing pixels and writes the difference picture (differences in red over a faded copy of the application). */
function diff(hf: PNG, app: PNG, tolerance: number): { count: number; png: PNG; total: number } {
  const w = Math.max(hf.width, app.width);
  const h = Math.max(hf.height, app.height);
  const out = new PNG({ width: w, height: h });
  let count = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      const inHf = x < hf.width && y < hf.height;
      const inApp = x < app.width && y < app.height;
      const a = inHf ? (y * hf.width + x) * 4 : -1;
      const b = inApp ? (y * app.width + x) * 4 : -1;
      let different = !(inHf && inApp); // a pixel that exists in one picture only is a difference
      if (!different) {
        for (let c = 0; c < 3; c++) if (Math.abs(hf.data[a + c] - app.data[b + c]) > tolerance) different = true;
      }
      if (different) {
        count++;
        out.data[o] = 255;
        out.data[o + 1] = 0;
        out.data[o + 2] = 0;
        out.data[o + 3] = 255;
      } else {
        const g = inApp ? Math.round((app.data[b] + app.data[b + 1] + app.data[b + 2]) / 3) : 255;
        out.data[o] = out.data[o + 1] = out.data[o + 2] = 255 - Math.round((255 - g) * 0.25);
        out.data[o + 3] = 255;
      }
    }
  }
  return { count, png: out, total: w * h };
}

/** Runs one screen and returns the result (the caller asserts `passed`). */
export async function compareScreen(browser: Browser, baseURL: string, s: UxScreen): Promise<UxResult> {
  const fixedTime = new Date(2026, 10, 26, 10, 0, 0);
  const dir = path.join(OUT, s.id);
  fs.mkdirSync(dir, { recursive: true });
  const hfBuf = await shootHf(browser, s, fixedTime);
  const appBuf = await shootApp(browser, baseURL, s, fixedTime);
  const files = { hf: path.join(dir, 'hf.png'), app: path.join(dir, 'app.png'), diff: path.join(dir, 'diff.png') };
  fs.writeFileSync(files.hf, hfBuf);
  fs.writeFileSync(files.app, appBuf);
  const hf = PNG.sync.read(hfBuf);
  const app = PNG.sync.read(appBuf);
  const d = diff(hf, app, s.channelTolerance ?? 24);
  fs.writeFileSync(files.diff, PNG.sync.write(d.png));
  const ratio = d.count / d.total;
  const sameSize = hf.width === app.width && hf.height === app.height;
  const result: UxResult = {
    id: s.id,
    hfSize: [hf.width, hf.height],
    appSize: [app.width, app.height],
    sameSize,
    diffPixels: d.count,
    totalPixels: d.total,
    ratio,
    passed: sameSize && ratio <= (s.maxDiffRatio ?? 0.005),
    files,
  };
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(result, null, 2));
  return result;
}
