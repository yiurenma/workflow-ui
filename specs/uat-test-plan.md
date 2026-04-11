# UAT E2E Test Plan — Workflow UI

**环境：** https://workflow-ui-gamma.vercel.app  
**生成日期：** 2026-04-11  
**覆盖 pm-doc-master.md 版本：** 2.8  
**测试框架：** Playwright 1.56 · Chromium  
**运行模式：** 直连 UAT（无 Mock）· Desktop Chrome + Mobile Chrome  

---

## 测试应用数据

| 名称 | 用途 | 创建方式 |
|------|------|---------|
| `E2E_TEST_APP_1` | 空应用，用于列表页测试 | globalSetup 自动创建 |
| `E2E_TEST_CANVAS` | 含节点工作流（克隆自 UK_DRFI_1） | globalSetup 自动创建 |

---

## 测试用例矩阵

### 【APP】应用管理

| TC ID | 描述 | 对应 US/AC | 文件 |
|-------|------|-----------|------|
| TC-APP-DESK-01 | 桌面表格渲染（含列） | APP-AC-01-D1 | applications-desktop.spec.ts |
| TC-APP-DESK-02 | 桌面分页控件可见 | APP-AC-01-D2 | applications-desktop.spec.ts |
| TC-APP-DESK-03 | 桌面总数显示 | APP-AC-01-D3 | applications-desktop.spec.ts |
| TC-APP-DESK-04 | 桌面搜索框过滤 | APP-AC-01-D2 | applications-desktop.spec.ts |
| TC-APP-DESK-05 | Open 按钮跳转画布 | APP-AC-01-G1 | applications-desktop.spec.ts |
| TC-APP-DESK-06 | Settings 打开模态框（不跳转） | APP-AC-18-D1 | applications-desktop.spec.ts |
| TC-APP-DESK-07 | History 打开抽屉（不跳转） | APP-AC-11-D1 | applications-desktop.spec.ts |
| TC-APP-DESK-08 | Copy 打开模态框 | APP-AC-10-D2 | applications-desktop.spec.ts |
| TC-APP-DESK-09 | Delete 弹出确认对话框 | APP-AC-03-D1 | applications-desktop.spec.ts |
| TC-APP-DESK-10 | Settings 含 Application Name 字段 | APP-AC-18-D1 | applications-desktop.spec.ts |
| TC-APP-MOB-01 | 移动卡片视图（非表格） | APP-AC-01-M1 | applications-mobile.spec.ts |
| TC-APP-MOB-02 | Desktop view 切换显示表格 | APP-AC-01-M3 | applications-mobile.spec.ts |
| TC-APP-MOB-03 | Mobile view 恢复卡片 | APP-AC-01-M3 | applications-mobile.spec.ts |
| TC-APP-MOB-04 | 点击卡片进入画布 | APP-AC-01-G1 | applications-mobile.spec.ts |
| TC-APP-MOB-05 | 省略号 → History 打开抽屉 | APP-AC-11-M1 | applications-mobile.spec.ts |
| TC-APP-MOB-06 | 省略号 → Copy 打开模态框 | APP-AC-10-M1 | applications-mobile.spec.ts |
| TC-APP-MOB-07 | 省略号 → Delete 确认 | APP-AC-03-M1 | applications-mobile.spec.ts |
| TC-APP-MOB-08 | Settings 打开模态框 | APP-AC-18-M1 | applications-mobile.spec.ts |
| TC-APP-MOB-09 | FAB 可见 | APP-AC-02-M1 | applications-mobile.spec.ts |
| TC-APP-MOB-10 | FAB 打开新建应用对话框 | APP-AC-02-M1 | applications-mobile.spec.ts |

### 【CV】画布

| TC ID | 描述 | 对应 US/AC | 文件 |
|-------|------|-----------|------|
| TC-CANVAS-01 | 画布容器可见 | CV-AC-04-D1 | canvas.spec.ts |
| TC-CANVAS-02 | 头部操作可访问（桌面/移动） | CV-US-04 | canvas.spec.ts |
| TC-CANVAS-03 | 无 JS 错误 | CV-US-04 | canvas.spec.ts |
| TC-CANVAS-04 | 空 pluginList 无崩溃 | CV-US-04 | canvas.spec.ts |
| TC-CANVAS-05 | Straighten 按钮可见 | CV-US-05 | canvas.spec.ts |
| TC-CANVAS-MOB-01 | 移动 FAB 可见 | CV-AC-05-M1 | canvas-mobile.spec.ts |
| TC-CANVAS-MOB-02 | FAB 打开 Add Node 抽屉 | CV-US-05 | canvas-mobile.spec.ts |
| TC-CANVAS-MOB-03 | 拖拽 FAB 不误触开抽屉 | APP-AC-02-M2 | canvas-mobile.spec.ts |
| TC-CANVAS-MOB-04 | FAB 位置持久化 localStorage | APP-AC-02-M2 | canvas-mobile.spec.ts |
| TC-CANVAS-MOB-05 | 桌面不显示 FAB | CV-US-05 | canvas-mobile.spec.ts |
| TC-CANVAS-MOB-06 | 移动 Save 按钮可见 | CV-AC-09-G2 | canvas-mobile.spec.ts |
| TC-CANVAS-MOB-07 | 移动 ⋯ 菜单触发可见 | CV-US-04 | canvas-mobile.spec.ts |
| TC-CANVAS-MOB-08 | ⋯ 含 Straighten/Explain/JsonPath/Run | CV-US-17,20 | canvas-mobile.spec.ts |
| TC-CANVAS-MOB-09 | 移动节点抽屉从底部弹出 | CV-US-07 | canvas-mobile.spec.ts |
| TC-NODE-01 | 点击节点打开配置抽屉 | CV-AC-07-D1 | node-editor.spec.ts |
| TC-NODE-02 | 抽屉含 Description/Rules/Action | CV-AC-30-D1 | node-editor.spec.ts |
| TC-GENERATOR-01 | Generate 按钮可访问 | CV-US-05 | canvas.spec.ts |
| TC-GENERATOR-02 | Generate 打开 AI Generator 模态框 | CV-US-05 | canvas.spec.ts |
| TC-JSONPATH-01 | JsonPath 按钮可访问 | CV-AC-07-G1 | canvas.spec.ts |
| TC-JSONPATH-02 | JsonPath Playground 模态框打开 | CV-AC-07-G1 | canvas.spec.ts |
| TC-JSONPATH-03 | 合法表达式返回结果 | CV-AC-07-G1 | canvas.spec.ts |
| TC-JSONPATH-04 | 非法 JSON 显示错误 | CV-AC-07-G1 | canvas.spec.ts |
| TC-JSONPATH-05 | 无匹配显示 "(no match)" | CV-AC-07-G1 | canvas.spec.ts |
| TC-EXPLAIN-01 | Explain 按钮可见 | CV-AC-20-D1 | explain.spec.ts |
| TC-EXPLAIN-02 | Explain 打开 Token/说明模态框 | CV-AC-20-D1 | explain.spec.ts |

### 【REC】运行记录

| TC ID | 描述 | 对应 US/AC | 文件 |
|-------|------|-----------|------|
| TC-REC-01 | 记录页无崩溃 | REC-AC-19-D1 | records.spec.ts |
| TC-REC-02 | 表格/卡片视图可见 | REC-AC-19-D1 | records.spec.ts |
| TC-REC-03 | 分页控件可见 | REC-AC-19-D2 | records.spec.ts |

### 【NAV】导航

| TC ID | 描述 | 文件 |
|-------|------|------|
| TC-NAV-01 | 根路由加载 | navigation.spec.ts |
| TC-NAV-02 | /workflows/ 路由解析 | navigation.spec.ts |
| TC-NAV-03 | /records/ 路由解析 | navigation.spec.ts |
| TC-NAV-04 | 未知路由优雅处理 | navigation.spec.ts |

---

**总计：50 个测试用例 × 2 项目（Desktop + Mobile）= 100 次运行**
