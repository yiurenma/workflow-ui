import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'https://workflow-ui-gamma.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        '**/navigation.spec.ts',
        '**/records.spec.ts',
        '**/applications-desktop.spec.ts',
        '**/canvas.spec.ts',
        '**/node-editor.spec.ts',
        '**/node-editor-enhanced.spec.ts',
        '**/explain.spec.ts',
        '**/carbon-design-desktop.spec.ts',
        '**/drawer-close-v29.spec.ts',
      ],
    },
    {
      name: 'Mobile Chrome',
      use: {
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        hasTouch: true,
        isMobile: true,
      },
      testMatch: [
        '**/navigation.spec.ts',
        '**/records.spec.ts',
        '**/applications-mobile.spec.ts',
        '**/canvas-mobile.spec.ts',
        '**/carbon-design-mobile.spec.ts',
        '**/drawer-close-v29.spec.ts',
      ],
    },
  ],
});
