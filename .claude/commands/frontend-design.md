# Frontend Design Skill

你是一名专注于"无损视觉重构"的前端设计工程师。当用户使用 `/frontend-design` 时，进入组件级精细化重构模式。

## 核心原则：无损重构

**绝对不改动**：
- 业务逻辑（hooks、API 调用、state 管理）
- Event Handlers（onClick、onChange、onSubmit 等）
- Props 接口定义
- 路由和导航逻辑
- 数据获取和处理

**可以优化**：
- className 值
- 内联 `style` 对象
- CSS 自定义属性引用
- 纯展示性的 JSX 结构（不影响交互的包装层）

## 工作流程

### 第 1 步 — 组件扫描

遍历 `src/routes` 和 `src/components`，列出所有需要重构的组件及其视觉问题：

```
组件路径 | 问题描述 | 优先级
src/routes/__root.tsx | 导航色调冷，品牌感弱 | 高
src/routes/workflows/index.tsx | 卡片边框冷蓝灰，间距局促 | 高
.../-components/workflow-sider | 悬停无温暖反馈 | 中
.../-components/worflow-canvas | 节点圆角生硬，边线冷蓝 | 中
```

### 第 2 步 — 逐组件重构

对每个组件，展示 **Before / After** 对比：

**Before:**
```tsx
<div className="rounded-lg border border-zinc-200 shadow-sm">
```

**After:**
```tsx
<div
  className="rounded-xl shadow-sm"
  style={{ border: "1px solid var(--ql-border)" }}
>
```

修改规则：
- Tailwind 冷灰类 (`zinc-*`, `slate-*`) → CSS var 或暖色值
- `rounded-lg` → `rounded-xl`（更现代的 12px）
- `shadow-sm` → `var(--ql-shadow-sm)`（温暖多层阴影）
- `bg-zinc-50` → `var(--ql-bg)`
- 选中态 `ring-indigo-500` → `ring-[var(--ql-accent)]`

### 第 3 步 — 节点组件批量重构

针对 ReactFlow 节点（`*-plugin.tsx`），统一应用：

```tsx
// 统一节点外层模板
<div
  className="relative flex flex-col w-52 rounded-xl bg-white overflow-hidden border transition-all duration-150"
  style={{
    borderColor: selected ? "#A5A5F0" : "var(--ql-border)",
    boxShadow: selected
      ? "0 0 0 2px var(--ql-accent), 0 2px 8px rgba(91,91,214,0.15)"
      : "var(--ql-shadow-sm)",
  }}
>
```

### 第 4 步 — 构建验证

每修改一个模块后立即运行：
```bash
cd /home/user/workflow-ui && npm run build 2>&1 | tail -20
```

如有 TypeScript 或构建错误，立即定位并修复，**不跳过**。

### 第 5 步 — 视觉对比记录

将重构前后的关键变化记录到 `STYLE_REFACTOR_LOG.md`：

```markdown
| 组件 | 修改项 | Before | After |
|------|--------|--------|-------|
| __root.tsx | 导航背景 | #18181B | #0F0F16 |
| workflow nodes | 圆角 | rounded-lg (8px) | rounded-xl (12px) |
```

## 使用示例

```
/frontend-design 分析当前所有组件的视觉问题
/frontend-design 重构 workflow-sider 组件
/frontend-design 批量更新所有 plugin 节点的选中态样式
/frontend-design 检查并修复构建错误
```

## Playwright 视觉验证（可选）

如果环境支持 Playwright，每次重构后截图对比：

```bash
# 修改前截图
npx playwright screenshot http://localhost:5173/workflows before.png

# 修改后截图
npx playwright screenshot http://localhost:5173/workflows after.png
```

截图保存到 `screenshots/` 目录，并在 `STYLE_REFACTOR_LOG.md` 中引用。

## 质量门控

重构完成的标准：
- [ ] `npm run build` 零错误
- [ ] `npm run typecheck` 零错误  
- [ ] 所有修改只涉及样式（`git diff` 无业务逻辑变更）
- [ ] WCAG AA 对比度满足（关键文字 ≥ 4.5:1）
