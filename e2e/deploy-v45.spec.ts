import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

test.describe('Deploy — Online API rewrite (TC-DEPLOY)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);

    // Mock online API deploy endpoint
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online'),
      async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ status: 'accepted', correlationId: 'deploy-test-001' }),
          });
        } else {
          await route.continue();
        }
      }
    );

    await page.goto('/workflows/', { waitUntil: 'networkidle' });
    await page.waitForSelector('table', { timeout: 15000 });
  });

  test('TC-DEPLOY-01 Deploy button visible in table Actions column', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await expect(deployBtn).toBeVisible({ timeout: 10000 });
  });

  test('TC-DEPLOY-02 Clicking Deploy opens modal with source application info block', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.getByText('Source Application', { exact: false })).toBeVisible();
  });

  test('TC-DEPLOY-03 Executing Application Name field is pre-filled', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    const nameInput = modal.getByPlaceholder('executing-application-name');
    await expect(nameInput).not.toHaveValue('');
  });

  test('TC-DEPLOY-04 User can change executing application name', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    const nameInput = modal.getByPlaceholder('executing-application-name');
    await nameInput.fill('my-target-env-app');
    await expect(nameInput).toHaveValue('my-target-env-app');
  });

  test('TC-DEPLOY-05 Deploy button disabled when executing name is empty', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    const nameInput = modal.getByPlaceholder('executing-application-name');
    await nameInput.fill('');
    const submitBtn = modal.getByRole('button', { name: /deploy to online api/i });
    await expect(submitBtn).toBeDisabled();
  });

  test('TC-DEPLOY-06 Successful deploy shows success result block', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    const submitBtn = modal.getByRole('button', { name: /deploy to online api/i });
    await submitBtn.click();
    await expect(modal.getByText(/deploy request sent/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-DEPLOY-07 Cancel button closes modal without deploying', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: 'Deploy' }).first();
    await deployBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });
});
