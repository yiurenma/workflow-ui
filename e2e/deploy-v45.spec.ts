import { test, expect } from '@playwright/test';
import { setupMocks, MOCK_APPS } from './mocks';

const BASE_URL = 'https://workflow-ui-gamma.vercel.app';

test.describe('TC-DEPLOY-V45 — Deploy rewrite (online API two-block body)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    // Default: online API returns success
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online/workflow'),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'OK', message: 'Deployed successfully' }),
        });
      }
    );
  });

  test('TC-DEPLOY-V45-01 — Deploy modal opens with target name pre-filled', async ({ page }) => {
    await page.goto(`${BASE_URL}/workflows`);
    await page.locator('table tbody tr').first().getByRole('button', { name: /deploy/i }).click();

    await expect(page.getByText('Deploy Application')).toBeVisible();
    const input = page.getByLabel(/target application name/i);
    await expect(input).toBeVisible();
    await expect(input).toHaveValue(MOCK_APPS[0].applicationName);
  });

  test('TC-DEPLOY-V45-02 — Form has single field only (no URL / credentials)', async ({ page }) => {
    await page.goto(`${BASE_URL}/workflows`);
    await page.locator('table tbody tr').first().getByRole('button', { name: /deploy/i }).click();

    await expect(page.getByLabel(/target application name/i)).toBeVisible();
    await expect(page.getByLabel(/deploy url/i)).not.toBeVisible();
    await expect(page.getByLabel(/username/i)).not.toBeVisible();
    await expect(page.getByLabel(/password/i)).not.toBeVisible();
    await expect(page.getByLabel(/environment/i)).not.toBeVisible();
  });

  test('TC-DEPLOY-V45-03 — Successful deploy shows green success block', async ({ page }) => {
    await page.goto(`${BASE_URL}/workflows`);
    await page.locator('table tbody tr').first().getByRole('button', { name: /deploy/i }).click();
    await page.getByRole('button', { name: /^deploy$/i }).click();

    await expect(page.getByText(/✓ success/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-DEPLOY-V45-04 — Online API called with correct applicationName query param', async ({ page }) => {
    const captured: string[] = [];
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online/workflow'),
      async (route) => {
        captured.push(route.request().url());
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    );

    await page.goto(`${BASE_URL}/workflows`);
    await page.locator('table tbody tr').first().getByRole('button', { name: /deploy/i }).click();
    await page.getByRole('button', { name: /^deploy$/i }).click();
    await expect(page.getByText(/✓ success/i)).toBeVisible({ timeout: 10000 });

    expect(captured.length).toBeGreaterThan(0);
    const url = new URL(captured[0]);
    expect(url.searchParams.get('applicationName')).toBe(MOCK_APPS[0].applicationName);
  });

  test('TC-DEPLOY-V45-05 — Request body contains entitySetting (Block A) and workflow (Block B)', async ({ page }) => {
    const bodies: string[] = [];
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online/workflow'),
      async (route) => {
        bodies.push(await route.request().postData() ?? '');
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    );

    await page.goto(`${BASE_URL}/workflows`);
    await page.locator('table tbody tr').first().getByRole('button', { name: /deploy/i }).click();
    await page.getByRole('button', { name: /^deploy$/i }).click();
    await expect(page.getByText(/✓ success/i)).toBeVisible({ timeout: 10000 });

    expect(bodies.length).toBeGreaterThan(0);
    const body = JSON.parse(bodies[0]);
    expect(body).toHaveProperty('entitySetting');
    expect(body).toHaveProperty('workflow');
    expect(body.entitySetting.applicationName).toBe(MOCK_APPS[0].applicationName);
    expect(body.workflow).toHaveProperty('pluginList');
  });

  test('TC-DEPLOY-V45-06 — API error response shows red error block', async ({ page }) => {
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online/workflow'),
      async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error' }),
        });
      }
    );

    await page.goto(`${BASE_URL}/workflows`);
    await page.locator('table tbody tr').first().getByRole('button', { name: /deploy/i }).click();
    await page.getByRole('button', { name: /^deploy$/i }).click();

    await expect(page.getByText(/✕ error/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-DEPLOY-V45-07 — User can override target name; new name used in API call', async ({ page }) => {
    const captured: string[] = [];
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online/workflow'),
      async (route) => {
        captured.push(route.request().url());
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    );

    await page.goto(`${BASE_URL}/workflows`);
    await page.locator('table tbody tr').first().getByRole('button', { name: /deploy/i }).click();
    const input = page.getByLabel(/target application name/i);
    await input.clear();
    await input.fill('custom-target-app');
    await page.getByRole('button', { name: /^deploy$/i }).click();
    await expect(page.getByText(/✓ success/i)).toBeVisible({ timeout: 10000 });

    const url = new URL(captured[0]);
    expect(url.searchParams.get('applicationName')).toBe('custom-target-app');
  });

  test('TC-DEPLOY-V45-08 — Cancel closes modal without calling API', async ({ page }) => {
    const captured: string[] = [];
    await page.route(
      (url) => url.pathname.startsWith('/api/proxy/online/workflow'),
      async (route) => { captured.push(route.request().url()); await route.continue(); }
    );

    await page.goto(`${BASE_URL}/workflows`);
    await page.locator('table tbody tr').first().getByRole('button', { name: /deploy/i }).click();
    await expect(page.getByText('Deploy Application')).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page.getByText('Deploy Application')).not.toBeVisible();
    expect(captured.length).toBe(0);
  });
});
