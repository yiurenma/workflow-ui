/**
 * Test data setup utilities
 * Creates test applications in UAT environment before running E2E tests
 */

const OPERATION_API = 'https://workflow-operation-api-n9sbp.ondigitalocean.app/api';

export interface TestApplication {
  applicationName: string;
  workflow: {
    pluginList: any[];
    uiMapList: any[];
  };
}

/**
 * Create a test application via operation API
 */
export async function createTestApplication(app: TestApplication): Promise<void> {
  const url = `${OPERATION_API}/workflow?applicationName=${encodeURIComponent(app.applicationName)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(app.workflow),
  });

  if (!response.ok) {
    throw new Error(`Failed to create test application ${app.applicationName}: ${response.status}`);
  }
}

/**
 * Ensure test applications exist in UAT
 */
export async function ensureTestData(): Promise<void> {
  const testApps: TestApplication[] = [
    {
      applicationName: 'E2E_TEST_APP_1',
      workflow: {
        pluginList: [],
        uiMapList: [],
      },
    },
    {
      applicationName: 'E2E_TEST_APP_2',
      workflow: {
        pluginList: [],
        uiMapList: [],
      },
    },
  ];

  for (const app of testApps) {
    try {
      await createTestApplication(app);
      console.log(`✓ Created test application: ${app.applicationName}`);
    } catch (error) {
      // Application might already exist, which is fine
      console.log(`  Test application ${app.applicationName} already exists or failed to create`);
    }
  }
}
