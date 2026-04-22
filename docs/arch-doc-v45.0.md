# Architecture Doc v45.0 — Deploy Rewrite: Online API Integration

**Label:** `TODO-deploy-rewrite-online-api-workflow-json`  
**Date:** 2026-04-22

## Change Scope

**workflow-ui only** — No backend changes in this task.

## Files Modified

| File | Change |
|------|--------|
| `src/components/DeployModal.tsx` | Full rewrite of deploy logic |
| `docs/pm-doc-v45.0.md` | New PM doc |
| `docs/arch-doc-v45.0.md` | New arch doc |
| `docs/test-doc-v45.0.md` | New test doc |

## Before (v38–v42)

DeployModal made 3 sequential fetch calls to a user-specified remote operation API URL:
1. `POST {baseUrl}/workflow/entity-setting?applicationName={name}` — Create application
2. `PATCH {baseUrl}/workflow/entity-setting?applicationName={name}` — Update settings
3. `POST {baseUrl}/workflow?applicationName={name}` — Save workflow

Required user inputs: Deploy URL, Application Name, Username, Password, Environment.  
CORS proxy: routed cross-origin requests through operation API deploy proxy.

## After (v45.0)

DeployModal makes a single call to the local Online API proxy:

```
POST /api/proxy/online/workflow
  ?applicationName={executionName}
  &confirmationNumber={uuid}
Headers:
  Content-Type: application/json
  X-Request-Correlation-Id: {uuid}   (auto-generated inside onlineApi.postWorkflow)
Body:
  {
    "sourceApplication": { ...WorkflowEntitySettingRow },
    "workflow": { ...WorkFlow }
  }
```

Uses `onlineApi.postWorkflow()` from `src/api/services/online.ts`.  
The `confirmationNumber` is auto-generated via `crypto.randomUUID()` per deploy click.

## State Machine

```
idle → in-progress → success
             └→ error
```

The Deploy button is disabled after success. Cancel becomes Close on success.

## Key Design Decisions

1. **No custom URL/auth** — Uses the local proxy (`/api/proxy/online`) so no user-facing credentials needed at this layer. The downstream deployment workflow (separate task) handles remote environment auth.

2. **Dual-block body** — `{ sourceApplication, workflow }` gives the eventual deployment workflow full context to perform CreateApplicationName → UpdateApplicationName → SaveWorkflow on the remote environment.

3. **executionName vs sourceApplication.applicationName** — These are intentionally distinct:
   - `sourceApplication.applicationName`: the Hub app being deployed from (read-only)
   - `executionName`: the runtime identity used by the Online API execution (user-entered)

4. **useEffect state reset** — Modal resets `executionName`, `deployStatus`, and `errorMsg` whenever `open` flips to true, preventing stale state when the user deploys different applications in sequence.

5. **No environment/channel fields** — `channelKind` optional param omitted for simplicity; can be added in a future task if needed.
