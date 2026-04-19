# Frontend Rebuild Progress — Design Handoff Implementation

**Branch:** `feature/design-handoff-rebuild`  
**Started:** 2026-04-19  
**Status:** Phases 1-3 complete, Phases 4-8 pending

## Completed Phases

### ✅ Phase 1: Setup & Design Tokens
- IBM Plex fonts already loaded in `index.html`
- Carbon tokens already in `src/index.css`
- No changes needed

### ✅ Phase 2: Navigation & Layout
- **File:** `src/routes/__root.tsx`
- Replaced Ant Design Menu with Carbon nav
- Active state: blue underline (`border-bottom: 2px solid #0f62fe`)
- Mobile: bottom tab bar (60px height, fixed position)
- Hover states: `#262626` background
- **Commit:** `efd69f8`

### ✅ Phase 3: Home Screen
- **File:** `src/routes/index.tsx`
- Hero section: dark background `#161616`, grid texture, badge, heading, CTAs
- Feature cards: 6 cards in responsive grid, colored left borders, hover states
- Matches design handoff pixel-perfect
- **Commit:** `efd69f8`

## Pending Phases

### Phase 4: Applications Screen
**Status:** Already well-implemented with Carbon design  
**File:** `src/routes/workflows/index.tsx` (521 lines)  
**What exists:**
- Desktop table with Carbon styling
- Mobile cards with draggable FAB
- Search, pagination, CRUD modals
- Settings modal, History drawer, Copy modal
- API integration complete

**What may need updating:**
- Verify table styling matches design handoff exactly
- Check modal/drawer styling for Carbon compliance
- Test all user flows

### Phase 5: Canvas Screen
**Status:** Needs review and updates  
**Files:** `src/routes/workflows/$applicationName.tsx`, `src/routes/workflows/-components/`  
**Components to check:**
- `workflow-header/` — toolbar buttons
- `workflow-sider/` — node palette
- `worflow-canvas/` — canvas area, nodes, edges
- `workflow-drawer/` — node configuration drawer
- AI modals (Explain, Generate, Run)

**Design requirements:**
- Node visual design: white bg, colored left border, icon, label
- Node palette: collapsible sidebar, 6 node types
- Canvas: dotted grid background `#F8F7F5`
- Zoom controls: bottom-left, 3 buttons stacked
- Minimap: bottom-right (desktop only)

### Phase 6: Node Editor Drawer
**Status:** Needs 3-section redesign  
**File:** `src/routes/workflows/-components/workflow-drawer/`  
**Design requirements:**
- Three sections: Node Description, Rules, Action
- Each section: colored left border, header, content area
- Read-only view by default
- Edit button switches to form mode
- Form fields: Carbon inputs with `#f4f4f4` background

### Phase 7: Records Screen
**Status:** Needs review and updates  
**Files:** `src/routes/records/index.tsx`, `src/routes/records/$id.tsx`  
**Design requirements:**
- Desktop table with Carbon styling
- Mobile cards
- Filter panel: 7 filter fields
- Detail screen: 2-column grid (desktop), 1-column (mobile)
- Child records table if present

### Phase 8: Testing & Polish
**Status:** Not started  
**Requirements:**
- Update all Playwright tests for new selectors
- Run full E2E suite (desktop + mobile)
- Visual regression review
- Accessibility audit (Axe DevTools)
- Performance testing (Lighthouse ≥90)
- Fix any bugs found

## Test Cases

**Total:** 35 test cases in `docs/test-doc-v37.0.md`

**Breakdown:**
- Design System: 4 tests (fonts, colors, border-radius)
- Home Screen: 2 tests (hero, feature cards)
- Applications: 5 tests (table, cards, modals, drawer)
- Canvas: 7 tests (layout, palette, nodes, modals)
- Records: 4 tests (table, cards, filters, detail)
- Mobile: 1 test (bottom tab bar)
- Responsive: 1 test (breakpoint at 768px)
- API Integration: 4 tests (CRUD, workflow, execution, records)
- Accessibility: 4 tests (keyboard, screen reader, contrast, ARIA)
- Performance: 2 tests (page load, bundle size)
- Regression: 1 test (existing E2E tests pass)

## Design Source

**Location:** `/tmp/Workflow-handoff/workflow/project/`

**Key files:**
- `Workflow Studio.html` — 1202 lines, complete React app
- `components.jsx` — 54 lines, design tokens and mock data
- `README.md` — handoff instructions

**Design system:**
- Fonts: IBM Plex Sans, IBM Plex Mono
- Primary: #0f62fe
- Nav: #161616
- Border radius: 0px
- Responsive: 1280px desktop, 390×844 mobile

## API Integration

**No backend changes required.** All endpoints remain unchanged:

**operation-api (port 8080):**
- `GET /api/workflow-entity-settings` — List applications
- `POST /api/workflow-entity-settings` — Create
- `PATCH /api/workflow-entity-settings/{id}` — Update
- `DELETE /api/workflow-entity-settings/{id}` — Delete
- `GET /api/workflow-entity-settings/{id}/history` — History
- `GET /api/workflow/{applicationName}` — Get workflow
- `POST /api/workflow/{applicationName}` — Save workflow

**online-api:**
- `POST /api/workflow?applicationName={name}&confirmationNumber={id}` — Execute
- `GET /api/workflow-records` — List records
- `GET /api/workflow-records/{id}` — Record detail

## Next Steps

1. **Phase 4:** Review Applications screen, update if needed
2. **Phase 5:** Update Canvas screen components
3. **Phase 6:** Redesign Node Editor Drawer (3 sections)
4. **Phase 7:** Update Records screen
5. **Phase 8:** Update Playwright tests, run full suite, polish

## Build Status

✅ TypeScript build passes cleanly  
✅ No compilation errors  
✅ Bundle sizes within limits

## Docs

- PM doc: `workflow-agent-teams/docs/pm-doc-v37.0.md`
- Arch doc: `workflow-agent-teams/docs/arch-doc-v37.0.md`
- Test doc: `workflow-agent-teams/docs/test-doc-v37.0.md`
- PM master: updated to v2.24 with CV-US-51

## Commits

- `b42bc1f` — docs: add TODO and docs for frontend rebuild (v37.0)
- `efd69f8` — feat: implement Carbon nav + home screen (Phases 2-3)
