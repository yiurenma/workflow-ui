import { defineConfig, devices } from '@playwright/test';

// Use the pre-installed Chromium binary (Playwright 1.56 browsers at rev 1194)
const CHROMIUM_EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// Target environment:
//   PLAYWRIGHT_BASE_URL=https://workflow-ui-gamma.vercel.app  → real UAT (requires open network)
//   default → local dev server with mocks (VITE_USE_MOCK=1, port 5174)
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5174';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      executablePath: CHROMIUM_EXEC,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: {
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
});
