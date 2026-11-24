/**
 * Component Override Leak Detection Test
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies that UX4G component variant classes (buttons, alerts) correctly
 * adopt brand colors under data-theme="brand", and that hardcoded values
 * from UX4G's CSS do NOT leak through.
 *
 * Run: npx test-storybook --url http://localhost:6006
 */

import { expect } from '@storybook/test';
import { getStoryContext } from '@storybook/test-runner';
import type { TestRunnerConfig } from '@storybook/test-runner';

/** Converts rgb(r, g, b) to lowercase hex. */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgb.toLowerCase();
  return (
    '#' +
    [match[1], match[2], match[3]]
      .map((n) => parseInt(n).toString(16).padStart(2, '0'))
      .join('')
  );
}

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    // ── Button Component Stories ───────────────────────────────────────────
    if (
      storyContext.title === 'Components/Button' &&
      storyContext.name === 'AllVariants'
    ) {
      // Activate brand theme.
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'brand');
      });

      // .btn-primary background should be brand teal, not UX4G purple.
      const btnPrimaryBg = await page.evaluate(() => {
        const btn = document.querySelector('.btn-primary') as HTMLElement | null;
        if (!btn) return '';
        return getComputedStyle(btn).backgroundColor;
      });

      const btnPrimaryHex = rgbToHex(btnPrimaryBg);
      // Brand primary = #00646B; UX4G purple = #613AF5
      expect(btnPrimaryHex).not.toBe('#613af5');
      expect(btnPrimaryHex).toBe('#00646b');

      // .btn-secondary background should be brand gold, not UX4G mauve.
      const btnSecondaryBg = await page.evaluate(() => {
        const btn = document.querySelector('.btn-secondary') as HTMLElement | null;
        if (!btn) return '';
        return getComputedStyle(btn).backgroundColor;
      });
      const btnSecondaryHex = rgbToHex(btnSecondaryBg);
      expect(btnSecondaryHex).not.toBe('#938bb6');
      expect(btnSecondaryHex).toBe('#f2b705');
    }

    // ── Alert Component Stories ────────────────────────────────────────────
    if (
      storyContext.title === 'Components/Alert' &&
      storyContext.name === 'AllVariants'
    ) {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'brand');
      });

      // .alert-primary background should be brand primary-50 (#EDF7F8).
      const alertPrimaryBg = await page.evaluate(() => {
        const alert = document.querySelector('.alert-primary') as HTMLElement | null;
        if (!alert) return '';
        return getComputedStyle(alert).backgroundColor;
      });
      const alertHex = rgbToHex(alertPrimaryBg);
      // UX4G default: #D1ECFD (light blue); Brand: #EDF7F8 (light teal)
      expect(alertHex).not.toBe('#d1ecfd');
      expect(alertHex).toBe('#edf7f8');
    }

    // ── Link Color ─────────────────────────────────────────────────────────
    if (storyContext.title === 'Tokens/Colors') {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'brand');
      });

      const linkColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--bs-link-color')
          .trim();
      });

      // Brand link: #00646B; UX4G default: #613AF5
      expect(linkColor.toLowerCase()).toBe('#00646b');
    }
  },
};

export default config;
