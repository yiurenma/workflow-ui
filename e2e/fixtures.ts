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
 * Get UK_DRFI_1 workflow as template
 */
async function getTemplateWorkflow(): Promise<any> {
  const response = await fetch(`${OPERATION_API}/workflow?applicationName=UK_DRFI_1`);
  if (response.ok) {
    const data = await response.json();
    return { pluginList: data.pluginList || [], uiMapList: data.uiMapList || [] };
  }
  return { pluginList: [], uiMapList: [] };
}

/**
 * Create a test application if it doesn't exist
 */
async function createTestApplication(applicationName: string, withWorkflow: boolean = false): Promise<void> {
  const url = `${OPERATION_API}/workflow?applicationName=${encodeURIComponent(applicationName)}`;

  const workflow = withWorkflow ? await getTemplateWorkflow() : { pluginList: [], uiMapList: [] };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflow),
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
  // Create apps with empty workflow for basic tests
  await createTestApplication('E2E_TEST_APP_1', false);
  await createTestApplication('E2E_TEST_APP_2', false);

  // Create app with UK_DRFI_1 workflow for canvas/node editor tests
  await createTestApplication('E2E_TEST_CANVAS', true);
}
