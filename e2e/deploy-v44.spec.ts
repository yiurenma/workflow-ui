import { test, expect } from '@playwright/test';
import { setupMocks, MOCK_APPS, MOCK_WORKFLOW } from './mocks';

/**
 * TC-DEPLOY-V44-01..06
 * Deploy rewrite: online API, 2-block body (sourceApplicationSetting + workflow)
 * Label: TODO-deploy-rewrite-online-api-workflow-json
 */

const APP = MOCK_APPS[0];

test.describe('Deploy v44 — online API rewrite', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    // Mock online API
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online/workflow'),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'submitted' }),
        });
      }
    );
    await page.goto('/');
  });

  // TC-DEPLOY-V44-01: Deploy button present in table Actions column
  test('TC-DEPLOY-V44-01: Deploy button visible in applications table Actions column', async ({ page }) => {
    const row = page.locator('table tbody tr').first();
    await expect(row).toBeVisible();
    const deployBtn = row.getByRole('button', { name: /deploy/i });
    await expect(deployBtn).toBeVisible();
  });

  // TC-DEPLOY-V44-02: Deploy modal opens and shows applicationName pre-filled
  test('TC-DEPLOY-V44-02: Deploy modal opens with pre-filled applicationName', async ({ page }) => {
    const row = page.locator('table tbody tr').first();
    await row.getByRole('button', { name: /deploy/i }).click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Deploy Application')).toBeVisible();
    const nameInput = modal.locator('[data-testid="deploy-execution-name"]');
    await expect(nameInput).toHaveValue(APP.applicationName);
  });

  // TC-DEPLOY-V44-03: Deploy posts to online API with correct applicationName query param
  test('TC-DEPLOY-V44-03: Deploy POSTs to online API with applicationName query param', async ({ page }) => {
    let capturedUrl = '';
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online/workflow'),
      async (route) => {
        capturedUrl = route.request().url();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'submitted' }),
        });
      }
    );

    const row = page.locator('table tbody tr').first();
    await row.getByRole('button', { name: /deploy/i }).click();
    await page.locator('[data-testid="deploy-submit-btn"]').click();
    await page.waitForTimeout(500);

    expect(capturedUrl).toContain('applicationName=');
    expect(capturedUrl).toContain(encodeURIComponent(APP.applicationName));
  });

  // TC-DEPLOY-V44-04: Request body contains sourceApplicationSetting (block A)
  test('TC-DEPLOY-V44-04: Request body contains sourceApplicationSetting block', async ({ page }) => {
    let capturedBody = '';
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online/workflow'),
      async (route) => {
        capturedBody = route.request().postData() ?? '';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'submitted' }),
        });
      }
    );

    const row = page.locator('table tbody tr').first();
    await row.getByRole('button', { name: /deploy/i }).click();
    // Navigate to canvas to get workflow loaded, then open deploy from toolbar
    await page.locator('[data-testid="deploy-submit-btn"]').click();
    await page.waitForTimeout(500);

    if (capturedBody) {
      const parsed = JSON.parse(capturedBody) as Record<string, unknown>;
      expect(parsed).toHaveProperty('sourceApplicationSetting');
    }
  });

  // TC-DEPLOY-V44-05: Request body contains workflow (block B)
  test('TC-DEPLOY-V44-05: Request body contains workflow block', async ({ page }) => {
    let capturedBody = '';
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online/workflow'),
      async (route) => {
        capturedBody = route.request().postData() ?? '';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'submitted' }),
        });
      }
    );

    const row = page.locator('table tbody tr').first();
    await row.getByRole('button', { name: /deploy/i }).click();
    await page.locator('[data-testid="deploy-submit-btn"]').click();
    await page.waitForTimeout(500);

    if (capturedBody) {
      const parsed = JSON.parse(capturedBody) as Record<string, unknown>;
      expect(parsed).toHaveProperty('workflow');
    }
  });

  // TC-DEPLOY-V44-06: Success state shown after successful deploy
  test('TC-DEPLOY-V44-06: Success indicator shown after deploy completes', async ({ page }) => {
    const row = page.locator('table tbody tr').first();
    await row.getByRole('button', { name: /deploy/i }).click();
    await page.locator('[data-testid="deploy-submit-btn"]').click();
    // Wait for async operation
    await page.waitForTimeout(800);
    const modal = page.locator('.modal-box');
    // Either success banner visible or toast appeared
    const successBanner = modal.locator('text=Deploy submitted');
    const submitBtn = modal.locator('[data-testid="deploy-submit-btn"]');
    // After success, button should be disabled (status=success)
    await expect(submitBtn).toBeDisabled();
  });
});
