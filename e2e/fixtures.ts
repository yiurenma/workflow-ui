import { test as base } from '@playwright/test';

const OPERATION_API = 'https://workflow-operation-api-n9sbp.ondigitalocean.app/api';

/**
 * Global test setup - ensures test data exists before running tests
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Ensure test applications exist before each test
    await ensureTestApplications();
    await use(page);
  },
});

export { expect } from '@playwright/test';

/**
 * Create a test application if it doesn't exist
 */
async function createTestApplication(applicationName: string): Promise<void> {
  const url = `${OPERATION_API}/workflow?applicationName=${encodeURIComponent(applicationName)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pluginList: [],
        uiMapList: [],
      }),
    });

    if (response.ok) {
      console.log(`✓ Created test application: ${applicationName}`);
    } else if (response.status === 409 || response.status === 400) {
      // Application already exists, which is fine
      console.log(`  Test application ${applicationName} already exists`);
    } else {
      console.warn(`Failed to create ${applicationName}: ${response.status}`);
    }
  } catch (error) {
    console.warn(`Error creating ${applicationName}:`, error);
  }
}

/**
 * Ensure required test applications exist in UAT
 */
async function ensureTestApplications(): Promise<void> {
  const testApps = [
    'E2E_TEST_APP_1',
    'E2E_TEST_APP_2',
    'E2E_TEST_APP_3',
  ];

  await Promise.all(testApps.map(app => createTestApplication(app)));
}
