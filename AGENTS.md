# AGENTS.md

## Project overview

**Workflow UI** — React 18 / Vite / TypeScript SPA. Uses:
- **TanStack Router** (file-based routing under `src/routes/`)
- **TanStack Query** for server state
- **Ant Design** (antd) component library
- **React Flow (XY Flow)** for the workflow canvas
- **Axios** via `src/api/` — two base clients: `operationApi` (port 8080) and `onlineApi` (port 8081)

## Prerequisites

- Node.js 18+
- npm

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Type-check | `npx tsc --noEmit` |

### Dev server with live backends

```bash
VITE_OPERATION_API_BASE=http://localhost:8080/api \
VITE_ONLINE_API_BASE=http://localhost:8081/api \
VITE_USE_MOCK=0 \
npm run dev
```

Mock mode (no backend needed): `VITE_USE_MOCK=1 npm run dev`

## Route structure

```
src/routes/
  index.tsx                        # Redirect to /workflows
  workflows/
    index.tsx                      # Workflow list table (FE-09: Description column)
    $applicationName.tsx           # Workflow canvas + drawer
    -components/
      worflow-canvas/              # XY Flow canvas, node plugins, useWorkflowForm hook
      workflow-drawer/             # Side drawer: HttpCallForm, LogicForm per node type
      settings-modal/              # Edit entity settings (PATCH endpoint)
      history-drawer/              # Revision history + rollback
  records/
    index.tsx                      # Execution records list with filter bar
    $id.tsx                        # Record detail: parent + children table
```

## Gotchas

- **Typo in folder name is intentional** — `worflow-canvas` (missing 'k') matches the existing directory; do not rename.
- **`node.data.backendPlugin` is the source of truth** — `onNodeFormChange` in `useWorkflowForm.ts` updates `node.data.backendPlugin` (not a flat spread onto `node.data`). `mergeCanvasIntoWorkFlow` in `workFlowMapper.ts` reads `node.data.backendPlugin` as priority over the stale server snapshot. Breaking this causes all drawer edits to be silently discarded on save.
- **`PluginFormData` imported from hook, not form** — `PluginFormData` is exported from `src/routes/workflows/-components/worflow-canvas/hooks/useWorkflowForm.ts`. The drawer `index.tsx` imports it from there.
- **Route paths must not have trailing slash** — TanStack Router typing rejects `/records/` (with slash); use `/records`.

---

## Test Plan

> **Scope:** workflow-ui — functional checks against live backends.
> **Last verified:** 2026-04-06.

### Type-check & lint (automated)

```bash
npx tsc --noEmit    # must produce 0 errors
npm run lint        # ESLint
```

### Manual E2E checklist

Prerequisites: dev server running (`npm run dev` with real backend env vars), operation-api on 8080, online-api on 8081.

#### FE-01 Workflow List Page (`/workflows`)

| Check | Expected |
|-------|----------|
| Page loads | Table with columns: Application Name, **Description**, Enabled, asyncMode, Created |
| Description column | Shows `eimId ?? defaultServiceAccount ?? region ?? "—"` |
| Click row | Navigates to canvas for that application |

#### FE-02 Workflow Canvas (`/workflows/<applicationName>`)

| Check | Expected |
|-------|----------|
| Nodes render | One node per plugin, positioned per `uiMap` |
| Edges render | Arrows connecting nodes per `uiMapList` |
| Node types present | `CONSUMER`, `MESSAGE`, `IFELSE`, `FUNCTION`, `FUNCTION_V2`, `FUNCTION_V3`, `CONSUMERWITHOUTERROR`, `DISPATCH` |
| Click node | Drawer opens on the right |

#### FE-03 Drawer — HTTP Call Nodes (CONSUMER / MESSAGE / DISPATCH)

| Check | Expected |
|-------|----------|
| Description field | Pre-filled from `backendPlugin.description` |
| Type field | Read-only, shows node type |
| Rules section | Lists all rules (key + remark), add/remove work |
| URL fields | Internal Request URL pre-filled |
| Response / Tracking schema | Present for all HTTP types |
| Edit and save | Changes reflected in canvas node label; saving workflow persists changes |

#### FE-04 Drawer — Logic Nodes (IFELSE / FUNCTION*)

| Check | Expected |
|-------|----------|
| Description field | Pre-filled |
| Rules section | Listed and editable |
| Save | Changes persisted to DB |

#### FE-05 Save Workflow

| Check | Expected |
|-------|----------|
| Click Save | `POST /api/workflow?applicationName=<name>` fired |
| Response | Canvas re-renders with server-assigned IDs |
| Round-trip | GET workflow returns same pluginList structure |

#### FE-06 Settings Modal

| Check | Expected |
|-------|----------|
| Open settings | Modal shows all entity setting fields pre-filled |
| Edit `asyncMode` | Toggle, save → `PATCH /api/workflow/entity-setting?applicationName=<name>` |
| Edit `retryProperties` | JSON string field, save → persisted |
| Workflow field | Not shown / not editable in settings modal |

#### FE-07 History Drawer

| Check | Expected |
|-------|----------|
| Open history | `GET /api/workflow/entity-setting/history?applicationName=<name>` |
| List shows revisions | Each row: revision number, date, type (INSERT/UPDATE) |
| Rollback button | Decodes `revision.entity.workflow` (base64) → calls `POST /api/workflow` |
| After rollback | Canvas reloads with rolled-back plugin list |

#### FE-08 New Node Types on Canvas

| Check | Expected |
|-------|----------|
| `CONSUMERWITHOUTERROR` node | Renders with distinct visual style |
| `FUNCTION_V3` node | Renders on canvas |
| Both draggable / connectable | Can create edges to/from them |

#### FE-09 Records Page (`/records`)

| Check | Expected |
|-------|----------|
| Page loads | Filter bar + table |
| Filter by applicationName | `?applicationName=<name>` applied |
| Filter by overallStatus | `?overallStatus=GI_SUCCESS` applied |
| Filter by date range | ISO-8601 with timezone sent (e.g. `2026-01-01T00:00:00.000+00:00`) |
| Pagination | Page controls work |
| Click row | Navigates to `/records/<id>` |

#### FE-10 Record Detail Page (`/records/<id>`)

| Check | Expected |
|-------|----------|
| Page loads | Descriptions panel for parent record fields |
| Children table | Shows child records (dispatch steps / retry chain) |
| Non-existent ID | Error state or 404 message shown |

### Known gotchas for agents

- **Import path for `PluginFormData`** — must come from `useWorkflowForm`, not from individual form components.
- **`backendPlugin` update pattern** — when adding new node types or form fields, always update `formDataToBackendPlugin` in `useWorkflowForm.ts` and the corresponding field extraction in `mergeCanvasIntoWorkFlow` in `workFlowMapper.ts`. Missing either half silently drops edits.
- **Date filter format** — the records API's `@DateTimeFormat(iso = DATE_TIME)` requires a full ISO-8601 string with timezone offset. Plain `2026-01-01T00:00:00` (no timezone) causes a 400 conversion error. Send `2026-01-01T00:00:00.000+00:00`.
