# TODO — Workflow UI E2E 测试

**最后更新：** 2026-04-11  
**本次运行结果：** 75 passed / 0 failed / 29 skipped（预期视口跳过）

---

## 失败用例

> 本次运行无失败用例。

---

## 已知问题与待改善项

### HIGH — 环境限制

| # | 问题 | 描述 | 建议修复 |
|---|------|------|---------|
| 1 | UAT 直连受阻 | `https://workflow-ui-gamma.vercel.app` 从该服务器 IP 返回 `403 host_not_allowed` | 将 CI 服务器 IP 加入 Vercel 白名单，或配置 `PLAYWRIGHT_BASE_URL` 环境变量通过 VPN/隧道访问 |

### MEDIUM — 测试覆盖缺口

| # | 缺口 | 对应 US | 建议 |
|---|------|---------|------|
| 2 | 记录详情页（`/records/$id`）未测试 | REC-US-19 FE-10 | 补充 `TC-REC-04`：点击记录行跳转详情；`TC-REC-05`：详情页显示父记录字段 |
| 3 | 创建应用完整流程（提交后列表刷新）未验证 | APP-US-02 | 补充 `TC-APP-CREATE-01`：填写表单 → 提交 → 列表出现新应用 |
| 4 | 配置历史回滚操作未端到端验证 | APP-US-11 | 补充 `TC-APP-HIST-01`：点击 Rollback → 画布更新 |
| 5 | 保存工作流后持久化验证 | CV-US-09 | 补充 `TC-CANVAS-SAVE-01`：Save → reload → 节点保持 |

### LOW — 代码质量

| # | 项目 | 建议 |
|---|------|------|
| 6 | `global-setup.ts` 已创建但未使用（UAT 直连受阻时无法初始化数据） | 恢复 UAT 连通性后在 `playwright.config.ts` 重新启用 `globalSetup` |
| 7 | 测试超时统一为 60s，部分简单断言超时过长 | 可按用例类型分级设置超时 |

---

## 下一步行动

- [ ] 解决 UAT IP 白名单问题（DevOps 配合）
- [ ] 补充 TC-REC-04/05（记录详情页）
- [ ] 补充 TC-APP-CREATE-01（创建流程完整验证）
- [ ] 在 UAT 网络恢复后重跑一次真实 E2E 并更新本报告
