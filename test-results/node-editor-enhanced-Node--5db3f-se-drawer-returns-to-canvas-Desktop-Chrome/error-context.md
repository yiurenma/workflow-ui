# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: node-editor-enhanced.spec.ts >> Node Editor — 5-Layer Validation (TC-NODE-ENHANCED) >> TC-NODE-ENHANCED-05 Close drawer returns to canvas
- Location: e2e/node-editor-enhanced.spec.ts:160:3

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  locator('.ant-drawer')
Expected: not visible
Received: visible
Timeout:  5000ms

Call log:
  - Expect "not toBeVisible" with timeout 5000ms
  - waiting for locator('.ant-drawer')
    9 × locator resolved to <div tabindex="-1" class="ant-drawer ant-drawer-right css-83tcid">…</div>
      - unexpected value "visible"

```

# Page snapshot

```yaml
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
                  - button "cloud-download HTTP Fetch Check customer eligibility" [active] [ref=e135]:
                    - generic [ref=e139]:
                      - img "cloud-download" [ref=e141]:
                        - img [ref=e142]
                      - generic [ref=e145]:
                        - generic [ref=e146]: HTTP Fetch
                        - generic [ref=e147]: Check customer eligibility
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
```

# Test source

```ts
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
  170 | 
  171 |     // Layer 5: Drawer closes (effect verification)
> 172 |     await expect(drawer).not.toBeVisible();
      |                              ^ Error: expect(locator).not.toBeVisible() failed
  173 | 
  174 |     // Canvas still visible
  175 |     const canvas = page.locator('.react-flow, [data-testid="rf__wrapper"]').first();
  176 |     await expect(canvas).toBeVisible();
  177 |   });
  178 | });
  179 | 
```