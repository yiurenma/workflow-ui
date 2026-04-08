import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'https://workflow-ui-gamma.vercel.app',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      testMatch: ['**/applications-desktop.spec.ts', '**/canvas.spec.ts', '**/explain.spec.ts', '**/navigation.spec.ts', '**/node-editor.spec.ts', '**/records.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      testMatch: ['**/applications-mobile.spec.ts', '**/canvas.spec.ts', '**/explain.spec.ts', '**/navigation.spec.ts', '**/node-editor.spec.ts', '**/records.spec.ts'],
      use: {
        ...devices['iPhone 12'],
        browserName: 'chromium',
      },
    },
  ],
});
