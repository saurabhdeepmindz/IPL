/**
 * Visual Regression Tests — Design Token Stories
 * ─────────────────────────────────────────────────────────────────────────────
 * Takes screenshots of token stories and component stories in BOTH theme modes.
 * Compares against baseline screenshots stored in tests/visual/__screenshots__.
 *
 * Run:
 *   npx playwright test tests/visual/tokens.spec.ts
 *
 * Update baselines:
 *   npx playwright test tests/visual/tokens.spec.ts --update-snapshots
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';

/** Storybook story ID format: title-name (lowercased, spaces replaced with hyphens). */
function storyUrl(title: string, name: string) {
  const id = `${title}--${name}`
    .toLowerCase()
    .replace(/\//g, '-')
    .replace(/\s+/g, '-');
  return `${BASE_URL}/iframe.html?id=${id}&viewMode=story`;
}

/** Stories to screenshot in both themes. */
const TOKEN_STORIES = [
  { title: 'tokens-colors', name: 'default' },
  { title: 'tokens-typography', name: 'default' },
  { title: 'tokens-spacing', name: 'default' },
  { title: 'tokens-radius', name: 'default' },
  { title: 'tokens-shadows', name: 'default' },
  { title: 'tokens-compare', name: 'default' },
];

const COMPONENT_STORIES = [
  { title: 'components-button', name: 'all-variants' },
  { title: 'components-button', name: 'sizes' },
  { title: 'components-button', name: 'states' },
  { title: 'components-input', name: 'default' },
  { title: 'components-input', name: 'validation-states' },
  { title: 'components-card', name: 'default' },
  { title: 'components-card', name: 'color-variants' },
  { title: 'components-alert', name: 'all-variants' },
  { title: 'components-alert', name: 'with-heading' },
];

const ALL_STORIES = [...TOKEN_STORIES, ...COMPONENT_STORIES];
const THEMES = ['brand', 'ux4g'] as const;

for (const theme of THEMES) {
  test.describe(`Theme: ${theme}`, () => {
    for (const { title, name } of ALL_STORIES) {
      test(`${title}/${name}`, async ({ page }) => {
        const url = storyUrl(title, name);
        await page.goto(url, { waitUntil: 'networkidle' });

        // Set theme via globals URL param (Storybook 8 supports this).
        await page.evaluate((t: string) => {
          document.documentElement.setAttribute('data-theme', t);
        }, theme);

        // Wait for any CSS transitions to complete.
        await page.waitForTimeout(300);

        await expect(page).toHaveScreenshot(`${theme}--${title}--${name}.png`, {
          fullPage: true,
          animations: 'disabled',
          threshold: 0.02, // 2% pixel diff tolerance
        });
      });
    }
  });
}
