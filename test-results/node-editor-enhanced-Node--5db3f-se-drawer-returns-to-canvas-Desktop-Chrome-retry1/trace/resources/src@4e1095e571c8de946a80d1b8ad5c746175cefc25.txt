import { Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

export const MOCK_APPS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  applicationName: `test-app-${String(i + 1).padStart(2, '0')}`,
  enabled: i % 2 === 0,
  asyncMode: false,
  retry: true,
  tracking: true,
  ignoreDuplicateRecordError: false,
  region: 'SG',
  eimId: `EIM-${1000 + i}`,
  defaultServiceAccount: `svc-account-${i + 1}`,
  createdDateTime: '2025-01-01T00:00:00Z',
  lastModifiedDateTime: '2025-06-01T00:00:00Z',
  createdBy: 'admin',
  lastModifiedBy: 'admin',
}));

export const MOCK_WORKFLOW = {
  pluginList: [
    {
      id: 1,
      description: 'Check customer eligibility',
      linkingIdOfRuleListAndAction: 'node-1',
      ruleList: [
        { id: 1, key: 'customerType', remark: 'Must be PREMIUM' },
        { id: 2, key: 'accountStatus', remark: 'Must be ACTIVE' },
      ],
      action: {
        type: 'HTTP',
        provider: 'eligibility-service',
        httpRequestMethod: 'POST',
        httpRequestBody: '{"customerId":"${customerId}"}',
        remark: 'Call eligibility API',
      },
      // uiMap must have `id` (string) and `position` for workFlowToNodesAndEdges mapper
      uiMap: { id: 'node-1', type: 'CONSUMER', position: { x: 100, y: 100 } },
    },
    {
      id: 2,
      description: 'Send notification',
      linkingIdOfRuleListAndAction: 'node-2',
      ruleList: [],
      action: {
        type: 'HTTP',
        provider: 'notification-service',
        httpRequestMethod: 'POST',
        httpRequestBody: '{"message":"approved"}',
        remark: 'Send approval notification',
      },
      uiMap: { id: 'node-2', type: 'CONSUMER', position: { x: 300, y: 100 } },
    },
  ],
  uiMapList: [
    { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'buttonEdge' },
  ],
};

export const MOCK_RECORDS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  applicationName: MOCK_APPS[i % MOCK_APPS.length].applicationName,
  requestCorrelationId: `corr-${i + 1}`,
  transactionConfirmationNumber: `TCN-${10000 + i}`,
  trackingNumber: `TRK-${20000 + i}`,
  customerId: `CUST-${30000 + i}`,
  overallStatus: i % 3 === 0 ? 'SUCCESS' : i % 3 === 1 ? 'FAILED' : 'PENDING',
  retryTimes: 0,
  createdDateTime: '2025-06-01T10:00:00Z',
  lastModifiedDateTime: '2025-06-01T10:01:00Z',
}));

export const MOCK_HISTORY = Array.from({ length: 3 }, (_, i) => ({
  revisionNumber: i + 1,
  revisionInstant: `2025-0${i + 1}-01T00:00:00Z`,
  revisionType: i === 0 ? 'INSERT' : 'UPDATE',
  entity: { ...MOCK_APPS[0], enabled: i % 2 === 0 },
}));

// ---------------------------------------------------------------------------
// URL classifiers — order matters (more specific first)
// ---------------------------------------------------------------------------

const isEntitySettingHistory = (url: URL) =>
  url.pathname.includes('/workflow/entity-setting/history');

const isEntitySetting = (url: URL) =>
  url.pathname.includes('/workflow/entity-setting') &&
  !url.pathname.includes('/history');

const isWorkflowRecords = (url: URL) =>
  url.pathname.includes('/workflow/records');

const isWorkflowAutoCopy = (url: URL) =>
  url.pathname.includes('/workflow/autoCopy');

const isWorkflowRoot = (url: URL) =>
  url.pathname.endsWith('/workflow') ||
  // path may include query string in some routing — also allow trailing slash
  url.pathname.replace(/\/$/, '').endsWith('/workflow');

// ---------------------------------------------------------------------------
// Mock interceptor — call this in beforeEach BEFORE page.goto()
// ---------------------------------------------------------------------------

export async function setupMocks(page: Page) {
  // Catch-all interceptor for /api/proxy/operation/* routes
  await page.route(
    (url) => url.pathname.startsWith('/api/proxy/operation/workflow'),
    async (route) => {
      const url = new URL(route.request().url());
      const method = route.request().method();

      // ---- entity-setting history ----
      if (isEntitySettingHistory(url)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: MOCK_HISTORY,
            totalElements: MOCK_HISTORY.length,
            totalPages: 1,
            size: 10,
            number: 0,
          }),
        });
        return;
      }

      // ---- entity-setting list / patch ----
      if (isEntitySetting(url)) {
        if (method === 'GET') {
          const pageNum = parseInt(url.searchParams.get('page') ?? '0');
          const size = parseInt(url.searchParams.get('size') ?? '5');
          const nameFilter = url.searchParams.get('applicationName') ?? '';
          const filtered = nameFilter
            ? MOCK_APPS.filter(a => a.applicationName.includes(nameFilter))
            : MOCK_APPS;
          const start = pageNum * size;
          const content = filtered.slice(start, start + size);
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              content,
              totalElements: filtered.length,
              totalPages: Math.ceil(filtered.length / size),
              size,
              number: pageNum,
              first: pageNum === 0,
              last: start + size >= filtered.length,
            }),
          });
        } else {
          // PATCH / POST entity-setting
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        }
        return;
      }

      // ---- records list ----
      if (isWorkflowRecords(url)) {
        if (method === 'GET' && !url.pathname.match(/records\/\d+/)) {
          const pageNum = parseInt(url.searchParams.get('page') ?? '0');
          const size = parseInt(url.searchParams.get('size') ?? '5');
          const start = pageNum * size;
          const content = MOCK_RECORDS.slice(start, start + size);
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              content,
              totalElements: MOCK_RECORDS.length,
              totalPages: Math.ceil(MOCK_RECORDS.length / size),
              size,
              number: pageNum,
            }),
          });
        } else {
          await route.continue();
        }
        return;
      }

      // ---- autoCopy ----
      if (isWorkflowAutoCopy(url)) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        return;
      }

      // ---- workflow canvas (GET / PUT / POST / DELETE) ----
      if (isWorkflowRoot(url) || url.searchParams.has('applicationName')) {
        if (method === 'DELETE') {
          await route.fulfill({ status: 204, body: '' });
        } else {
          // GET / PUT / POST — return mock workflow
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_WORKFLOW),
          });
        }
        return;
      }

      // Fallback — let unmatched requests through
      await route.continue();
    },
  );
}

/**
 * On mobile, header actions (Explain, JsonPath, Run) are inside the ⋯ dropdown.
 * On desktop they are direct buttons. This helper abstracts both.
 */
export async function clickCanvasHeaderAction(page: Page, name: string) {
  const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
  if (isMobile) {
    await page.getByRole('button', { name: /more actions/i }).click();
    await page.locator('.ant-dropdown-menu').getByText(name).click();
  } else {
    await page.getByRole('button', { name: new RegExp(name, 'i') }).click();
  }
}
