import { defineConfig, devices } from '@playwright/test';

// Use the pre-installed Chromium binary (Playwright 1.56 browsers at rev 1194)
const CHROMIUM_EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'https://workflow-ui-gamma.vercel.app',
    trace: 'on-first-retry',
    launchOptions: {
      executablePath: CHROMIUM_EXEC,
    },
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari (via Chromium)',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
