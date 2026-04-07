# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation — TC-NAV >> TC-NAV-04 unknown route handled gracefully
- Location: e2e/navigation.spec.ts:22:3

# Error details

```
Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/does-not-exist-route-xyz
Call log:
  - navigating to "https://workflow-ui-gamma.vercel.app/does-not-exist-route-xyz", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Navigation — TC-NAV', () => {
  4  |   test('TC-NAV-01 app loads at root', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     // Should load without a JS crash — check for any visible content
  7  |     await expect(page.locator('body')).not.toBeEmpty();
  8  |   });
  9  | 
  10 |   test('TC-NAV-02 applications list route resolves', async ({ page }) => {
  11 |     await page.goto('/workflows/');
  12 |     // "Applications" heading should be visible
  13 |     await expect(page.getByText('Applications').first()).toBeVisible();
  14 |   });
  15 | 
  16 |   test('TC-NAV-03 records list route resolves', async ({ page }) => {
  17 |     await page.goto('/records/');
  18 |     // Page loads — either shows data or empty state
  19 |     await expect(page.locator('body')).not.toBeEmpty();
  20 |   });
  21 | 
  22 |   test('TC-NAV-04 unknown route handled gracefully', async ({ page }) => {
> 23 |     const response = await page.goto('/does-not-exist-route-xyz');
     |                                 ^ Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/does-not-exist-route-xyz
  24 |     // Either a 404 page renders or SPA redirect — no crash
  25 |     await expect(page.locator('body')).not.toBeEmpty();
  26 |     // Should not show a blank white error screen with a JS exception banner
  27 |     const hasJsError = await page.locator('text=Uncaught').count();
  28 |     expect(hasJsError).toBe(0);
  29 |   });
  30 | });
  31 | 
```