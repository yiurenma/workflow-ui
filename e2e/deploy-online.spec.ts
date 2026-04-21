import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

const ONLINE_WORKFLOW_URL = /\/api\/proxy\/online\/workflow/;

test.describe('Deploy to Online — Desktop (TC-DEPLOY-ONLINE)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.route(ONLINE_WORKFLOW_URL, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
    });
    await page.goto('/workflows/', { waitUntil: 'networkidle' });
    await page.waitForSelector('table', { timeout: 15000 });
  });

  test('TC-DEPLOY-ONLINE-01 Deploy button visible in table actions', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await expect(deployBtn).toBeVisible({ timeout: 10000 });
  });

  test('TC-DEPLOY-ONLINE-02 Deploy modal opens with correct title', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.modal-title')).toContainText('Deploy to Online');
  });

  test('TC-DEPLOY-ONLINE-03 Execution name pre-filled with source application name', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    const input = modal.locator('input').first();
    await expect(input).not.toHaveValue('');
  });

  test('TC-DEPLOY-ONLINE-04 Source application shown as read-only field', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.getByText('Source Application')).toBeVisible();
  });

  test('TC-DEPLOY-ONLINE-05 Payload summary shows Block A and Block B', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.getByText(/Block A/)).toBeVisible();
    await expect(modal.getByText(/Block B/)).toBeVisible();
    await expect(modal.getByText(/Payload Summary/i)).toBeVisible();
  });

  test('TC-DEPLOY-ONLINE-06 Deploy button calls online API with correct structure', async ({ page }) => {
    let capturedUrl = '';
    let capturedBody: Record<string, unknown> = {};

    await page.route(ONLINE_WORKFLOW_URL, async (route) => {
      capturedUrl = route.request().url();
      try {
        capturedBody = JSON.parse(route.request().postData() ?? '{}');
      } catch { /* ignore */ }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
    });

    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByRole('button', { name: 'Deploy' }).click();
    await page.waitForTimeout(2000);

    expect(capturedUrl).toBeTruthy();
    const url = new URL(capturedUrl);
    expect(url.searchParams.has('applicationName')).toBe(true);
    expect(capturedBody).toHaveProperty('applicationSettings');
    expect(capturedBody).toHaveProperty('workflow');
  });

  test('TC-DEPLOY-ONLINE-07 Cancel button closes modal without deploying', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });
});
