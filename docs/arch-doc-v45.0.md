# Architecture Doc v45.0 — Deploy Rewrite: Online API Integration

**Version:** 45.0  
**Date:** 2026-04-21

## Component Changed

- `src/components/DeployModal.tsx` — full rewrite (no interface change to consumers)

## API Used

Existing service: `src/api/services/online.ts` → `onlineApi.postWorkflow()`

No new backend endpoints or services added.

## Request Structure

```
POST /api/proxy/online/workflow?applicationName={executionAppName}
Content-Type: application/json
X-Request-Correlation-Id: {uuid}

{
  "applicationSettings": { ...WorkflowEntitySettingRow },
  "workflow": { ...WorkFlow }
}
```

## Data Flow

```
User clicks Deploy (in workflows/index.tsx)
  → operationApi.getWorkflow(applicationName)      [existing fetch]
  → setDeployTarget({ settings, workflow })
  → <DeployModal open currentSettings currentWorkflow />
      → user confirms executionApplicationName
      → onlineApi.postWorkflow({
            applicationName: executionAppName,
            body: JSON.stringify({
              applicationSettings: currentSettings,
              workflow: currentWorkflow,
            }),
            contentType: "application/json"
        })
      → success / error state
```

## Props Interface (unchanged)

```typescript
interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  currentWorkflow: WorkFlow | null;
  currentSettings: WorkflowEntitySettingRow | null;
}
```

## State (simplified from v42.0)

```typescript
// v42.0 had: form (5 fields), deploying, progress (3-step array)
// v45.0:
const [executionAppName, setExecutionAppName] = useState("");
const [deploying, setDeploying] = useState(false);
const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle");
const [errorMessage, setErrorMessage] = useState("");
```

## Removed

- `buildUrl()` helper (CORS proxy routing)
- `isCrossOrigin()` helper
- `deployToRemote()` 3-step function
- `resetProgress()` and `updateProgress()` helpers
- `DeployFormData` interface
- `DeployProgress` interface
- `STEP_LABELS` constant
