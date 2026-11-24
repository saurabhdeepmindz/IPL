/**
 * @file playwright.config.ts
 * @summary Playwright set-up. Visual token tests run against the built Storybook;
 *          end-to-end tests (tests/e2e) run against the Next.js app.
 * @subtask ST-ADM01-000-FE-01
 * In plain words: serves the finished Storybook on port 6006 and saves the
 * screenshots and the report under test-results so they can be shown to the team.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['visual/**/*.spec.ts', 'e2e/**/*.spec.ts'],
  outputDir: './test-results/playwright',
  reporter: [['list'], ['html', { outputFolder: './test-results/playwright-report', open: 'never' }]],
  use: { browserName: 'chromium', baseURL: 'http://localhost:6006' },
  webServer: {
    command: 'npx http-server storybook-static -p 6006 -s',
    url: 'http://localhost:6006',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
