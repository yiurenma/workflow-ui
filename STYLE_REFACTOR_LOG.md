# Style Refactor Log — Quiet Luxury Redesign

**Branch:** `claude/luxury-minimal-ui-redesign-Wpvqj`  
**Date:** 2026-04-11  
**Scope:** Pure visual refactor — zero changes to business logic, event handlers, or props.

---

## Design System: Quiet Luxury

The redesign shifts the palette from cold zinc/blue-gray to a warm, premium tone system, elevates border-radius, refines shadows, and deepens the navigation surface. No functional behaviour was altered.

### Before vs After — Token Comparison

| Token | Before | After | Rationale |
|---|---|---|---|
| Primary colour | `#4F46E5` (harsh indigo) | `#5B5BD6` (soft indigo-violet) | Less saturated, more sophisticated |
| Nav background | `#18181B` (cold black) | `#0F0F16` (deep navy-black) | Warmer dark, premium depth |
| Nav border | `#3F3F46` (zinc-700) | `#1E1E2C` (warm dark) | More refined contrast |
| Page background | `#FAFAFA` / `bg-zinc-50` | `#F8F7F5` (warm off-white) | Warm parchment tone vs cold blue-gray |
| Card border | `#E4E4E7` (zinc-200) | `#E2DDD9` (warm sand) | Warmer, less clinical |
| Table hover | `bg-zinc-50` | `#F3F1EE` | Warm hover feedback |
| Edge/connector stroke | `#94A3B8` (slate-400, cold) | `#C4BEB9` (warm taupe) | Harmonises with warm palette |
| Canvas dot grid | `#CBD5E1` (slate-300, cold) | `#D8D3CE` (warm stone) | Blends into warm canvas |
| Canvas background | `bg-zinc-50` | `#F8F7F5` | Consistent warm surface |
| Border-radius (global) | 6 px | 8 px | Softer, more modern luxury |
| Border-radius (cards/modals) | 8 px | 10–14 px | Premium rounding on containers |
| Handle colour | `#94A3B8` (cold slate) | `#C4BEB9` (warm taupe) | Unifies with edge colours |
| Handle hover | `#4F46E5` | `#5B5BD6` (CSS var) | Matches new primary |
| Font stack | `Inter` | `Inter, -apple-system, ...` | Explicit fallback chain |
| Text primary | `text-zinc-800/900` | `#1A1918` (warm near-black) | Slightly warmer, higher richness |
| Text secondary | `text-zinc-400/500` | `#9E9893` (warm muted) | Warm gray replaces cool gray |

---

## Files Modified

### `src/index.css`
- Added comprehensive `:root` CSS custom properties block (`--ql-*` tokens)
- Warm off-white body background (`#F8F7F5`)
- Updated `.handle-style` — warm taupe resting colour, smooth transition
- Updated React Flow controls/minimap — warm borders, 8px radius
- Updated Ant Design table header + row hover with warm tones
- Added drawer header border token
- Added thin warm scrollbar styles
- `-webkit-font-smoothing: antialiased` for crisper text

### `src/routes/__root.tsx` — Navigation Header
- `ConfigProvider` primary colour: `#4F46E5` → `#5B5BD6`
- Global `borderRadius`: 6 → 8; `fontFamily` explicit Inter stack
- Added `colorBorder`, `colorBorderSecondary`, `colorText`, `colorTextSecondary` tokens
- Added per-component overrides: `Button.fontWeight`, `Modal.borderRadiusLG`, `Drawer.borderRadiusLG`
- Header: height `h-12` (48px) → 52px; background `#18181B` → `#0F0F16`
- Header bottom border: `border-zinc-800` → `#1E1E2C`
- Brand icon: plain `AppstoreOutlined` → framed icon badge with subtle accent glass effect
- Brand wordmark: tracking refined to `-0.025em`
- Menu `darkItemBg` updated to match nav

### `src/routes/workflows/index.tsx` — Applications List
- Page outer container: `bg-zinc-50` → `background: var(--ql-bg)`
- Mobile cards: `rounded-lg border-zinc-200` → `rounded-xl` + warm border via CSS var
- Desktop table: `rounded-lg border-zinc-200` → `rounded-xl` + warm border via CSS var
- Alternating row: `bg-zinc-50` → `bg-[#F3F1EE]`
- Mobile FAB: `bg-indigo-600 hover:bg-indigo-700` → `var(--ql-accent)` / `var(--ql-accent-hover)`

### `src/routes/workflows/-components/workflow-header/index.tsx` — Toolbar
- Toolbar container border: `border-zinc-200` → `border-bottom: 1px solid var(--ql-border)`
- Straighten / JsonPath / Run buttons: `border-zinc-300 text-zinc-600` → warm CSS var equivalents
- Generate button: `border-indigo-300 text-indigo-600` → `border: #A5A5F0; color: var(--ql-accent)`

### `src/routes/workflows/-components/workflow-sider/index.tsx` — Node Palette
- Sider border: `border-zinc-200` → CSS var `var(--ql-border)`
- Group labels: `text-zinc-400` → `var(--ql-text-muted)`
- Item hover: `hover:bg-zinc-50` → `var(--ql-bg-hover)` via `onMouseEnter/Leave`
- Item text: `text-zinc-600` → `var(--ql-text-secondary)`
- Collapse button: `text-zinc-400` → `var(--ql-text-muted)`
- Divider: `border-zinc-100` → `var(--ql-border-subtle)`

### `src/routes/workflows/-components/worflow-canvas/index.tsx` — Canvas
- Edge stroke: `#94A3B8` → `#C4BEB9` (warm taupe)
- Arrow marker: `#94A3B8` → `#C4BEB9`
- Dot grid background: `bg-zinc-50` → `#F8F7F5`; dot colour `#CBD5E1` → `#D8D3CE`

### Plugin Nodes (all 5: function, consumer, consumer-without-error, function-v3, iflese, message)
- Outer container: `rounded-lg` → `rounded-xl`
- Border: `border-zinc-200` (Tailwind class) → `borderColor: var(--ql-border)` (inline style)
- Selected state: `ring-indigo-500 border-indigo-300` → accent ring `#5B5BD6` + lavender border
- Node title: `text-zinc-800` → `var(--ql-text-primary)`
- Node subtitle: `text-zinc-400` → `var(--ql-text-muted)`
- Shadow: `shadow-sm` → `var(--ql-shadow-sm)` (warm multi-layer shadow)

---

## Visual Comparison Summary

| Surface | Before | After |
|---|---|---|
| Page canvas | Cold blue-white `#FAFAFA` | Warm parchment `#F8F7F5` |
| Navigation bar | Cold charcoal `#18181B` | Deep navy `#0F0F16` with brand badge |
| Card borders | Cold zinc `#E4E4E7` | Warm sand `#E2DDD9` |
| Node cards | 8px radius, cold borders | 12px radius, warm borders, refined ring |
| Edge connectors | Cold slate-blue `#94A3B8` | Warm taupe `#C4BEB9` |
| Primary CTA | Harsh indigo `#4F46E5` | Refined violet `#5B5BD6` |
| Scrollbars | Browser default | Thin 5px warm-tinted thumbs |
| Hover states | `bg-zinc-50` (cold) | `#F3F1EE` (warm) |

---

## What Was Intentionally Left Unchanged

- All business logic, API hooks, state management, event handlers
- All component props and interfaces
- Layout structure and responsive breakpoints
- Tailwind `zinc-*` classes on **text content** where they represent semantic intent (e.g. `text-red-500` for danger, `color="green"` tags)
- Workflow node `ACCENT` colour constants (each node type retains its distinct colour identity)
- The amber colour on the **Explain** button (intentionally kept as a luxury gold accent)
