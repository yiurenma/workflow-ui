# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: applications-desktop.spec.ts >> Applications list — Desktop (TC-APP-DESK) >> TC-APP-DESK-06 Settings button opens modal (no navigation)
- Location: e2e/applications-desktop.spec.ts:48:3

# Error details

```
Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/workflows/
Call log:
  - navigating to "https://workflow-ui-gamma.vercel.app/workflows/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // These tests run in Desktop Chrome project (≥ 768 px)
  4   | test.describe('Applications list — Desktop (TC-APP-DESK)', () => {
  5   |   test.beforeEach(async ({ page }) => {
> 6   |     await page.goto('/workflows/');
      |                ^ Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/workflows/
  7   |     // Wait for the list to stabilise
  8   |     await page.waitForLoadState('networkidle');
  9   |   });
  10  | 
  11  |   test('TC-APP-DESK-01 table renders with columns', async ({ page }) => {
  12  |     // Ant Design table has role=table or identifiable column headers
  13  |     const table = page.locator('table').first();
  14  |     await expect(table).toBeVisible();
  15  |   });
  16  | 
  17  |   test('TC-APP-DESK-02 pagination visible below table', async ({ page }) => {
  18  |     // Ant Design Pagination component
  19  |     const pagination = page.locator('.ant-pagination').first();
  20  |     await expect(pagination).toBeVisible();
  21  |   });
  22  | 
  23  |   test('TC-APP-DESK-03 total count shown', async ({ page }) => {
  24  |     // "N total" text
  25  |     await expect(page.getByText(/total/).first()).toBeVisible();
  26  |   });
  27  | 
  28  |   test('TC-APP-DESK-04 search filters list', async ({ page }) => {
  29  |     const searchInput = page.getByPlaceholder('Search application name').first();
  30  |     await expect(searchInput).toBeVisible();
  31  |     await searchInput.fill('__unlikely_search_string__');
  32  |     await searchInput.press('Enter');
  33  |     await page.waitForLoadState('networkidle');
  34  |     // Either a result or empty state — no crash
  35  |     await expect(page.locator('body')).not.toBeEmpty();
  36  |   });
  37  | 
  38  |   test('TC-APP-DESK-05 Open button navigates to canvas', async ({ page }) => {
  39  |     const openBtn = page.getByRole('link', { name: 'Open' }).first();
  40  |     if (await openBtn.count() === 0) {
  41  |       test.skip(); // No applications exist
  42  |       return;
  43  |     }
  44  |     await openBtn.click();
  45  |     await expect(page).not.toHaveURL('/workflows/');
  46  |   });
  47  | 
  48  |   test('TC-APP-DESK-06 Settings button opens modal (no navigation)', async ({ page }) => {
  49  |     const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
  50  |     if (await settingsBtn.count() === 0) {
  51  |       test.skip();
  52  |       return;
  53  |     }
  54  |     const urlBefore = page.url();
  55  |     await settingsBtn.click();
  56  |     // Modal should appear
  57  |     await expect(page.locator('.ant-modal')).toBeVisible();
  58  |     expect(page.url()).toBe(urlBefore);
  59  |   });
  60  | 
  61  |   test('TC-APP-DESK-07 History button opens drawer (no navigation)', async ({ page }) => {
  62  |     const historyBtn = page.getByRole('button', { name: 'History' }).first();
  63  |     if (await historyBtn.count() === 0) {
  64  |       test.skip();
  65  |       return;
  66  |     }
  67  |     const urlBefore = page.url();
  68  |     await historyBtn.click();
  69  |     await expect(page.locator('.ant-drawer')).toBeVisible();
  70  |     expect(page.url()).toBe(urlBefore);
  71  |   });
  72  | 
  73  |   test('TC-APP-DESK-08 Copy button opens modal', async ({ page }) => {
  74  |     const copyBtn = page.getByRole('button', { name: 'Copy' }).first();
  75  |     if (await copyBtn.count() === 0) {
  76  |       test.skip();
  77  |       return;
  78  |     }
  79  |     const urlBefore = page.url();
  80  |     await copyBtn.click();
  81  |     await expect(page.locator('.ant-modal')).toBeVisible();
  82  |     // Modal should contain a name input
  83  |     await expect(page.getByPlaceholder('Target application name')).toBeVisible();
  84  |     expect(page.url()).toBe(urlBefore);
  85  |   });
  86  | 
  87  |   test('TC-APP-DESK-09 Delete button shows confirm dialog', async ({ page }) => {
  88  |     const deleteBtn = page.getByRole('button', { name: 'Delete' }).first();
  89  |     if (await deleteBtn.count() === 0) {
  90  |       test.skip();
  91  |       return;
  92  |     }
  93  |     const urlBefore = page.url();
  94  |     await deleteBtn.click();
  95  |     await expect(page.locator('.ant-modal-confirm')).toBeVisible();
  96  |     // Cancel the dialog
  97  |     await page.getByRole('button', { name: 'Cancel' }).click();
  98  |     expect(page.url()).toBe(urlBefore);
  99  |   });
  100 | });
  101 | 
```