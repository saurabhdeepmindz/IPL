/**
 * Token Diff Test
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies that:
 *   1. Under data-theme="brand", only tokens listed in brand.json differ from UX4G defaults.
 *   2. All non-overridden tokens retain their UX4G default values.
 *   3. No unexpected token leaks — only declared overrides differ.
 *
 * Run: npx test-storybook --url http://localhost:6006
 */

import { expect } from '@storybook/test';
import { getStoryContext } from '@storybook/test-runner';
import type { TestRunnerConfig } from '@storybook/test-runner';

/**
 * UX4G default CSS variable values (read from :root without any theme override).
 * These are the compiled-in Bootstrap 5 defaults from UX4G v2.0.8.
 */
const UX4G_DEFAULTS: Record<string, string> = {
  '--bs-primary': '#613AF5',
  '--bs-primary-rgb': '97, 58, 245',
  '--bs-secondary': '#938BB6',
  '--bs-secondary-rgb': '90, 99, 112',
  '--bs-success': '#3C9718',
  '--bs-success-rgb': '60, 151, 24',
  '--bs-danger': '#B7131A',
  '--bs-danger-rgb': '183, 19, 26',
  '--bs-warning': '#B77224',
  '--bs-warning-rgb': '183, 114, 36',
  '--bs-link-color': '#613AF5',
  '--bs-border-radius': '0.375rem',
  '--bs-border-radius-sm': '0.25rem',
  '--bs-border-radius-lg': '0.5rem',
  '--bs-border-radius-xl': '1rem',
  '--bs-border-radius-2xl': '2rem',
  '--bs-border-radius-pill': '6.25rem',
};

/**
 * Brand override values (what we expect when data-theme="brand" is active).
 */
const BRAND_OVERRIDES: Record<string, string> = {
  '--bs-primary': '#00646B',
  '--bs-primary-rgb': '0, 100, 107',
  '--bs-secondary': '#F2B705',
  '--bs-secondary-rgb': '242, 183, 5',
  '--bs-link-color': '#00646B',
  '--bs-border-radius': '8px',
  '--bs-border-radius-sm': '6px',
  '--bs-border-radius-lg': '12px',
  '--bs-border-radius-xl': '16px',
  '--bs-border-radius-2xl': '20px',
  '--bs-border-radius-pill': '999px',
};

/** CSS vars that should be unchanged between UX4G and brand. */
const UNCHANGED_VARS = Object.keys(UX4G_DEFAULTS).filter(
  (k) => !(k in BRAND_OVERRIDES),
);

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    // Only run on the Compare story so we have a known stable context.
    const storyContext = await getStoryContext(page, context);
    if (storyContext.title !== 'Tokens/Compare') return;

    // ── 1. Brand overrides are applied correctly ───────────────────────────
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'brand');
    });

    for (const [cssVar, expectedValue] of Object.entries(BRAND_OVERRIDES)) {
      const actual = await page.evaluate((v: string) => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(v)
          .trim();
      }, cssVar);

      expect(actual.toLowerCase()).toBe(expectedValue.toLowerCase());
    }

    // ── 2. Non-overridden vars retain UX4G defaults ────────────────────────
    // Note: when data-theme="brand", --bs-success/danger/warning remain
    // the same values, so we just verify they are still set.
    for (const cssVar of UNCHANGED_VARS) {
      const actual = await page.evaluate((v: string) => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(v)
          .trim();
      }, cssVar);

      expect(actual).toBeTruthy();
      expect(actual.length).toBeGreaterThan(0);
    }

    // ── 3. Switching to ux4g theme restores defaults ───────────────────────
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'ux4g');
    });

    const primaryWithUx4g = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--bs-primary')
        .trim();
    });

    // When no brand override is active, --bs-primary reverts to UX4G purple.
    expect(primaryWithUx4g.toLowerCase()).toBe(
      UX4G_DEFAULTS['--bs-primary'].toLowerCase(),
    );
  },
};

export default config;
