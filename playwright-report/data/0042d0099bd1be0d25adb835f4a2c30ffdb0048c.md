# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: node-editor-enhanced.spec.ts >> Node Editor — 5-Layer Validation (TC-NODE-ENHANCED) >> TC-NODE-ENHANCED-01 Desktop drawer meets all 5 layers
- Location: e2e/node-editor-enhanced.spec.ts:23:3

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds", "help": "Elements must meet minimum color contrast ratio thresholds", "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright", "id": "color-contrast", "impact": "serious", "nodes": [{"all": [], "any": [{"data": {"bgColor": "#ffffff", "contrastRatio": 2.62, "expectedContrastRatio": "4.5:1", "fgColor": "#9f9fa9", "fontSize": "9.0pt (12px)", "fontWeight": "normal", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 2.62 (foreground color: #9f9fa9, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1", "relatedNodes": [{"html": "<div class=\"mb-4 border border-zinc-200 rounded-lg p-3 bg-white shadow-sm\">", "target": [".mb-4.p-3.border:nth-child(1)"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 2.62 (foreground color: #9f9fa9, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1", "html": "<p class=\"text-xs text-zinc-400 mb-3\">The name shown on the canvas. What is this step called?</p>", "impact": "serious", "none": [], "target": [".mb-4.p-3.border:nth-child(1) > .mb-3"]}, {"all": [], "any": [{"data": {"bgColor": "#ffffff", "contrastRatio": 2.62, "expectedContrastRatio": "4.5:1", "fgColor": "#9f9fa9", "fontSize": "9.0pt (12px)", "fontWeight": "normal", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 2.62 (foreground color: #9f9fa9, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1", "relatedNodes": [{"html": "<div class=\"mb-4 border border-zinc-200 rounded-lg p-3 bg-white shadow-sm\">", "target": [".mb-4.p-3.border:nth-child(2)"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 2.62 (foreground color: #9f9fa9, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1", "html": "<p class=\"text-xs text-zinc-400 mb-3\">Run only when… — conditions that must all match before this step executes.</p>", "impact": "serious", "none": [], "target": [".mb-4.p-3.border:nth-child(2) > .mb-3"]}, {"all": [], "any": [{"data": {"bgColor": "#fafafa", "contrastRatio": 2.51, "expectedContrastRatio": "4.5:1", "fgColor": "#9f9fa9", "fontSize": "9.0pt (12px)", "fontWeight": "normal", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 2.51 (foreground color: #9f9fa9, background color: #fafafa, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1", "relatedNodes": [{"html": "<div class=\"mb-4 border border-zinc-200 rounded-lg p-3 bg-zinc-50 shadow-sm\">", "target": [".mb-4.p-3.bg-zinc-50"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 2.51 (foreground color: #9f9fa9, background color: #fafafa, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1", "html": "<p class=\"text-xs text-zinc-400 mb-3\">What the system does when this step runs.</p>", "impact": "serious", "none": [], "target": [".mb-4.p-3.bg-zinc-50 > .mb-3"]}], "tags": ["cat.color", "wcag2aa", "wcag143", "TTv5", "TT13.c", "EN-301-549", "EN-9.1.4.3", "ACT", "RGAAv4", "RGAA-3.2.1"]}]
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - img "appstore" [ref=e6]:
          - img [ref=e7]
        - generic [ref=e9]: Workflow Studio
        - generic [ref=e10]: "|"
      - menu [ref=e11]:
        - menuitem "home Home" [ref=e12] [cursor=pointer]:
          - img "home" [ref=e13]:
            - img [ref=e14]
          - link "Home" [ref=e17]:
            - /url: /
        - menuitem "unordered-list Applications" [ref=e18] [cursor=pointer]:
          - img "unordered-list" [ref=e19]:
            - img [ref=e20]
          - link "Applications" [ref=e23]:
            - /url: /workflows
        - menuitem "file-text Records" [ref=e24] [cursor=pointer]:
          - img "file-text" [ref=e25]:
            - img [ref=e26]
          - link "Records" [ref=e29]:
            - /url: /records
        - menuitem "info-circle About" [ref=e30] [cursor=pointer]:
          - img "info-circle" [ref=e31]:
            - img [ref=e32]
          - link "About" [ref=e36]:
            - /url: /about
        - menuitem [disabled]:
          - img:
            - img
    - main [ref=e37]:
      - generic [ref=e39]:
        - complementary [ref=e40]:
          - generic [ref=e42]:
            - button "menu-fold" [ref=e44] [cursor=pointer]:
              - img "menu-fold" [ref=e46]:
                - img [ref=e47]
            - generic [ref=e49]: Nodes
            - generic [ref=e50]:
              - generic [ref=e51]:
                - img "cloud-download" [ref=e53]:
                  - img [ref=e54]
                - generic [ref=e57]: HTTP Fetch
              - generic [ref=e58]:
                - img "safety-certificate" [ref=e60]:
                  - img [ref=e61]
                - generic [ref=e63]: Safe Fetch
              - generic [ref=e64]:
                - img "send" [ref=e66]:
                  - img [ref=e67]
                - generic [ref=e69]: Dispatch
              - generic [ref=e70]:
                - img "branches" [ref=e72]:
                  - img [ref=e73]
                - generic [ref=e75]: Condition
              - generic [ref=e76]:
                - img "code" [ref=e78]:
                  - img [ref=e79]
                - generic [ref=e81]: Transform
              - generic [ref=e82]:
                - img "thunderbolt" [ref=e84]:
                  - img [ref=e85]
                - generic [ref=e87]: Transform+
        - generic [ref=e88]:
          - generic [ref=e89]:
            - generic [ref=e90]:
              - link "arrow-left" [ref=e92] [cursor=pointer]:
                - /url: /workflows
                - img "arrow-left" [ref=e93]:
                  - img [ref=e94]
              - generic [ref=e98]: test-app-01
            - generic [ref=e99]:
              - button "Straighten" [ref=e101] [cursor=pointer]:
                - generic [ref=e102]: Straighten
              - button "bulb Explain" [ref=e104] [cursor=pointer]:
                - img "bulb" [ref=e106]:
                  - img [ref=e107]
                - generic [ref=e109]: Explain
              - button "robot Generate" [ref=e111] [cursor=pointer]:
                - img "robot" [ref=e113]:
                  - img [ref=e114]
                - generic [ref=e116]: Generate
              - button "JsonPath" [ref=e118] [cursor=pointer]:
                - generic [ref=e119]: JsonPath
              - button "Run" [ref=e121] [cursor=pointer]:
                - generic [ref=e122]: Run
              - button "Save" [ref=e124] [cursor=pointer]:
                - generic [ref=e125]: Save
          - main [ref=e126]:
            - generic [ref=e127]:
              - generic [ref=e129]:
                - generic:
                  - generic:
                    - img
                    - img:
                      - button "Edge from node-1 to node-2"
                  - button "close" [ref=e131] [cursor=pointer]:
                    - img "close" [ref=e132]:
                      - img [ref=e133]
                  - generic:
                    - button "cloud-download HTTP Fetch Test node description" [ref=e135]:
                      - generic [ref=e139]:
                        - img "cloud-download" [ref=e141]:
                          - img [ref=e142]
                        - generic [ref=e145]:
                          - generic [ref=e146]: HTTP Fetch
                          - generic [ref=e147]: Test node description
                    - button "cloud-download HTTP Fetch Send notification" [ref=e149]:
                      - generic [ref=e153]:
                        - img "cloud-download" [ref=e155]:
                          - img [ref=e156]
                        - generic [ref=e159]:
                          - generic [ref=e160]: HTTP Fetch
                          - generic [ref=e161]: Send notification
              - generic "React Flow controls" [ref=e163]:
                - button "zoom in" [disabled]:
                  - img
                - button "zoom out" [ref=e164] [cursor=pointer]:
                  - img [ref=e165]
                - button "fit view" [ref=e167] [cursor=pointer]:
                  - img [ref=e168]
                - button "toggle interactivity" [ref=e170] [cursor=pointer]:
                  - img [ref=e171]
              - img "React Flow mini map" [ref=e174]
              - img
              - link "React Flow attribution" [ref=e178] [cursor=pointer]:
                - /url: https://reactflow.dev
                - text: React Flow
  - dialog "Node Configuration" [ref=e181]:
    - generic [ref=e183]:
      - button "Close" [ref=e184] [cursor=pointer]:
        - img "close" [ref=e185]:
          - img [ref=e186]
      - generic [ref=e189]:
        - generic [ref=e190]: Node Configuration
        - generic [ref=e191]: Check customer eligibility
    - generic [ref=e192]:
      - generic "Drag to resize panel" [ref=e193]
      - generic [ref=e194]:
        - generic [ref=e195]:
          - generic [ref=e196]:
            - paragraph [ref=e197]: Node Description
            - img "info-circle" [ref=e198]:
              - img [ref=e199]
          - paragraph [ref=e202]: The name shown on the canvas. What is this step called?
          - generic [ref=e204]:
            - generic "Step Name" [ref=e206]:
              - text: Step Name
              - img "question-circle" [ref=e207]:
                - img [ref=e208]
            - textbox "Step Name question-circle" [active] [ref=e214]:
              - /placeholder: Step description (shown as node label)
              - text: Test node description
        - generic [ref=e215]:
          - generic [ref=e216]:
            - paragraph [ref=e217]: Rules
            - img "info-circle" [ref=e218]:
              - img [ref=e219]
          - paragraph [ref=e222]: Run only when… — conditions that must all match before this step executes.
          - generic [ref=e223]:
            - textbox "$.messageInformation[?(@.field == \"value\")]" [ref=e230]: customerType
            - textbox "Human-readable explanation" [ref=e237]: Must be PREMIUM
            - img "minus-circle" [ref=e239] [cursor=pointer]:
              - img [ref=e240]
          - generic [ref=e243]:
            - textbox "$.messageInformation[?(@.field == \"value\")]" [ref=e250]: accountStatus
            - textbox "Human-readable explanation" [ref=e257]: Must be ACTIVE
            - img "minus-circle" [ref=e259] [cursor=pointer]:
              - img [ref=e260]
          - button "plus Add rule" [ref=e263] [cursor=pointer]:
            - img "plus" [ref=e265]:
              - img [ref=e266]
            - generic [ref=e269]: Add rule
        - generic [ref=e270]:
          - generic [ref=e271]:
            - paragraph [ref=e272]: Action
            - img "info-circle" [ref=e273]:
              - img [ref=e274]
          - paragraph [ref=e277]: What the system does when this step runs.
          - generic [ref=e279]:
            - generic "Provider Name" [ref=e281]:
              - text: Provider Name
              - img "question-circle" [ref=e282]:
                - img [ref=e283]
            - textbox "Provider Name question-circle" [ref=e289]:
              - /placeholder: e.g. CustomerDataService
              - text: eligibility-service
          - generic [ref=e291]:
            - generic "Plugin Type" [ref=e293]:
              - text: Plugin Type
              - img "question-circle" [ref=e294]:
                - img [ref=e295]
            - textbox "Plugin Type question-circle" [disabled] [ref=e301]: HTTP
          - generic [ref=e303]:
            - generic "Step Note" [ref=e305]:
              - text: Step Note
              - img "question-circle" [ref=e306]:
                - img [ref=e307]
            - textbox "Step Note question-circle" [ref=e313]:
              - /placeholder: Step remark
              - text: Call eligibility API
          - generic [ref=e315]:
            - generic "HTTP Method" [ref=e317]
            - generic [ref=e321] [cursor=pointer]:
              - generic [ref=e323]:
                - combobox "HTTP Method" [ref=e325]
                - generic "POST" [ref=e326]
              - generic:
                - img:
                  - img
          - generic [ref=e328]:
            - generic "External URL" [ref=e330]:
              - text: External URL
              - img "question-circle" [ref=e331]:
                - img [ref=e332]
            - textbox "External URL question-circle" [ref=e338]:
              - /placeholder: https://example.com/api/...
          - generic [ref=e340]:
            - generic "Internal URL" [ref=e342]:
              - text: Internal URL
              - img "question-circle" [ref=e343]:
                - img [ref=e344]
            - textbox "Internal URL question-circle" [ref=e350]:
              - /placeholder: https://internal.example.com/api/...
          - generic [ref=e352]:
            - generic "Request Headers" [ref=e354]:
              - text: Request Headers
              - img "question-circle" [ref=e355]:
                - img [ref=e356]
            - textbox "Request Headers question-circle" [ref=e362]:
              - /placeholder: "{\"Content-Type\": \"application/json\"}"
          - generic [ref=e364]:
            - generic "Request Body" [ref=e366]:
              - text: Request Body
              - img "question-circle" [ref=e367]:
                - img [ref=e368]
            - textbox "Request Body question-circle" [ref=e374]:
              - /placeholder: Request body template
              - text: "{ \"customerId\": \"${customerId}\" }"
          - generic [ref=e376]:
            - generic "Response Extraction Schema" [ref=e378]:
              - text: Response Extraction Schema
              - img "question-circle" [ref=e379]:
                - img [ref=e380]
            - textbox "Response Extraction Schema question-circle" [ref=e386]:
              - /placeholder: JSONPath or schema to extract from response
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { setupMocks } from './mocks';
  3   | import AxeBuilder from '@axe-core/playwright';
  4   | 
  5   | /**
  6   |  * Enhanced Node Editor tests demonstrating 5-Layer Validation Framework
  7   |  *
  8   |  * Layer 1: Existence (toBeVisible / toBeAttached)
  9   |  * Layer 2: Size sufficiency (boundingBox - mobile drawer >35% vh, desktop >200px)
  10  |  * Layer 3: Viewport visibility (toBeInViewport - content not clipped)
  11  |  * Layer 4: Interactivity (real interactions - fill/click/check, not just toBeVisible)
  12  |  * Layer 5: Effect verification (toHaveValue / toHaveURL / state changes)
  13  |  */
  14  | 
  15  | test.describe('Node Editor — 5-Layer Validation (TC-NODE-ENHANCED)', () => {
  16  |   test.beforeEach(async ({ page }) => {
  17  |     await setupMocks(page);
  18  |     await page.goto('/workflows/test-app-01');
  19  |     await page.waitForLoadState('load');
  20  |     await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  21  |   });
  22  | 
  23  |   test('TC-NODE-ENHANCED-01 Desktop drawer meets all 5 layers', async ({ page }) => {
  24  |     const viewport = page.viewportSize();
  25  |     const isMobile = (viewport?.width ?? 1280) < 768;
  26  | 
  27  |     if (isMobile) {
  28  |       test.skip();
  29  |       return;
  30  |     }
  31  | 
  32  |     // Trigger: click first node
  33  |     const node = page.locator('.react-flow__node').first();
  34  |     await node.click();
  35  | 
  36  |     const drawer = page.locator('.ant-drawer');
  37  | 
  38  |     // Layer 1: Existence
  39  |     await expect(drawer).toBeVisible({ timeout: 5000 });
  40  | 
  41  |     // Layer 2: Size sufficiency (desktop drawer should be >200px height)
  42  |     const box = await drawer.boundingBox();
  43  |     expect(box).not.toBeNull();
  44  |     expect(box!.height).toBeGreaterThan(200);
  45  | 
  46  |     // Layer 3: Viewport visibility - key sections must be in viewport
  47  |     const descriptionSection = drawer.getByText(/description/i).first();
  48  |     await expect(descriptionSection).toBeInViewport();
  49  | 
  50  |     // Layer 4: Interactivity - description input must be editable and focusable
  51  |     const descInput = drawer.locator('input, textarea').first();
  52  |     await expect(descInput).toBeEditable();
  53  |     await descInput.click();
  54  |     await expect(descInput).toBeFocused();
  55  | 
  56  |     // Layer 5: Effect - input accepts value
  57  |     await descInput.fill('Test node description');
  58  |     await expect(descInput).toHaveValue('Test node description');
  59  | 
  60  |     // Visual regression
  61  |     await expect(drawer).toHaveScreenshot('node-editor-desktop.png', {
  62  |       maxDiffPixelRatio: 0.03,
  63  |     });
  64  | 
  65  |     // Accessibility
  66  |     const axeResults = await new AxeBuilder({ page })
  67  |       .include('.ant-drawer')
  68  |       .analyze();
> 69  |     expect(axeResults.violations).toHaveLength(0);
      |                                   ^ Error: expect(received).toHaveLength(expected)
  70  |   });
  71  | 
  72  |   test('TC-NODE-ENHANCED-02 Mobile drawer meets all 5 layers', async ({ page }) => {
  73  |     const viewport = page.viewportSize();
  74  |     const isMobile = (viewport?.width ?? 1280) < 768;
  75  | 
  76  |     if (!isMobile) {
  77  |       test.skip();
  78  |       return;
  79  |     }
  80  | 
  81  |     // Trigger: tap first node
  82  |     const node = page.locator('.react-flow__node').first();
  83  |     await node.tap();
  84  | 
  85  |     const drawer = page.locator('.ant-drawer-bottom');
  86  | 
  87  |     // Layer 1: Existence
  88  |     await expect(drawer).toBeVisible({ timeout: 5000 });
  89  | 
  90  |     // Layer 2: Size sufficiency (mobile drawer >35% viewport height)
  91  |     const box = await drawer.boundingBox();
  92  |     const vh = viewport!.height;
  93  |     expect(box).not.toBeNull();
  94  |     expect(box!.height).toBeGreaterThan(vh * 0.35);
  95  | 
  96  |     // Layer 3: Viewport visibility - Description section must be in viewport
  97  |     const descriptionSection = drawer.getByText(/description/i).first();
  98  |     await expect(descriptionSection).toBeInViewport();
  99  | 
  100 |     // Layer 4: Interactivity - first input must be editable
  101 |     const firstInput = drawer.locator('input, textarea').first();
  102 |     await expect(firstInput).toBeEditable();
  103 |     await firstInput.tap();
  104 |     await expect(firstInput).toBeFocused();
  105 | 
  106 |     // Layer 5: Effect - input accepts value
  107 |     await firstInput.fill('Mobile test description');
  108 |     await expect(firstInput).toHaveValue('Mobile test description');
  109 | 
  110 |     // Visual regression
  111 |     await expect(drawer).toHaveScreenshot('node-editor-mobile.png', {
  112 |       maxDiffPixelRatio: 0.03,
  113 |     });
  114 | 
  115 |     // Accessibility - touch targets must be ≥44px
  116 |     const axeResults = await new AxeBuilder({ page })
  117 |       .include('.ant-drawer-bottom')
  118 |       .analyze();
  119 |     expect(axeResults.violations).toHaveLength(0);
  120 |   });
  121 | 
  122 |   test('TC-NODE-ENHANCED-03 Three-panel layout all sections in viewport', async ({ page }) => {
  123 |     const node = page.locator('.react-flow__node').first();
  124 |     await node.click();
  125 | 
  126 |     const drawer = page.locator('.ant-drawer');
  127 |     await expect(drawer).toBeVisible();
  128 | 
  129 |     // Layer 3: All three sections must be in viewport (not clipped)
  130 |     const description = drawer.getByText(/description/i).first();
  131 |     const rules = drawer.getByText(/rule/i).first();
  132 |     const action = drawer.getByText(/action/i).first();
  133 | 
  134 |     await expect(description).toBeInViewport();
  135 |     await expect(rules).toBeInViewport();
  136 |     await expect(action).toBeInViewport();
  137 |   });
  138 | 
  139 |   test('TC-NODE-ENHANCED-04 Rules section JSON input actionable', async ({ page }) => {
  140 |     const node = page.locator('.react-flow__node').first();
  141 |     await node.click();
  142 | 
  143 |     const drawer = page.locator('.ant-drawer');
  144 |     await expect(drawer).toBeVisible();
  145 | 
  146 |     // Find Rules section textarea
  147 |     const rulesSection = drawer.locator('textarea').nth(1); // Assuming Rules is second textarea
  148 | 
  149 |     // Layer 4: Must be editable and accept JSON
  150 |     await expect(rulesSection).toBeEditable();
  151 |     await rulesSection.click();
  152 |     await expect(rulesSection).toBeFocused();
  153 | 
  154 |     // Layer 5: Accepts JSON input
  155 |     const testJson = '{"path": "$.customer.id", "operator": "equals", "value": "C001"}';
  156 |     await rulesSection.fill(testJson);
  157 |     await expect(rulesSection).toHaveValue(testJson);
  158 |   });
  159 | 
  160 |   test('TC-NODE-ENHANCED-05 Close drawer returns to canvas', async ({ page }) => {
  161 |     const node = page.locator('.react-flow__node').first();
  162 |     await node.click();
  163 | 
  164 |     const drawer = page.locator('.ant-drawer');
  165 |     await expect(drawer).toBeVisible();
  166 | 
  167 |     // Find close button
  168 |     const closeBtn = drawer.locator('.ant-drawer-close, button[aria-label="Close"]').first();
  169 |     await closeBtn.click();
```