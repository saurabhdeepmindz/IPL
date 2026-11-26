/**
 * @file playwright.config.ts
 * @summary Playwright set-up. Visual token tests run against the built Storybook;
 *          end-to-end tests (tests/e2e) run against the Next.js app.
 * @subtask ST-ADM01-000-FE-01
 * In plain words: serves the finished Storybook on port 6006 and saves the
 * screenshots and the report under test-results so they can be shown to the team.
 */
import { defineConfig } from '@playwright/test';

/** E2E=1 runs the journeys (`tests/e2e`) against Next on port 3001 and the built API on port 3100; otherwise the visual suite runs on the static Storybook. */
const journeys = process.env.E2E === '1';

export default defineConfig({
  testDir: './tests',
  testMatch: journeys ? ['e2e/**/*.spec.ts'] : ['visual/**/*.spec.ts'],
  outputDir: journeys ? './test-results/e2e' : './test-results/playwright',
  reporter: [['list'], ['html', { outputFolder: './test-results/playwright-report', open: 'never' }]],
  workers: journeys ? 1 : undefined,
  timeout: journeys ? 60_000 : 30_000,
  use: journeys
    ? { browserName: 'chromium', baseURL: 'http://localhost:3001', screenshot: 'only-on-failure', trace: 'retain-on-failure' }
    : { browserName: 'chromium', baseURL: 'http://localhost:6006' },
  webServer: journeys
    ? {
        command: 'npx next build && npx next start -p 3001',
        url: 'http://localhost:3001/login',
        reuseExistingServer: true,
        timeout: 300_000,
        env: { NEXT_PUBLIC_API_BASE_URL: process.env.API_URL ?? 'http://localhost:3100/api/v1', NEXT_PUBLIC_DEV_SIGN_IN: 'true', NEXT_PUBLIC_AUTH_API_BASE_URL: process.env.AUTH_API_URL ?? 'http://localhost:3200/api/v1' },
      }
    : { command: 'npx http-server storybook-static -p 6006 -s', url: 'http://localhost:6006', reuseExistingServer: true, timeout: 60_000 },
});
