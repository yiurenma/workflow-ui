# Test Doc v45.0 — Deploy Rewrite: Online API Integration

**Label:** `TODO-deploy-rewrite-online-api-workflow-json`  
**Date:** 2026-04-22

## Test Cases

### TC-DEPLOY-ONLINE-01: Deploy button calls Online API

**Steps:**
1. Open application list
2. Click Deploy on any application
3. Modal opens showing Source Application (read-only) and Execution Application Name (pre-filled)
4. Click Deploy

**Expected:** Single API call to `POST /api/proxy/online/workflow?applicationName=...&confirmationNumber=...`  
**Not expected:** Calls to remote operation API (entity-setting POST/PATCH or workflow POST)

---

### TC-DEPLOY-ONLINE-02: Request body has two parts

**Steps:**
1. Open Deploy modal
2. Intercept the outgoing network request
3. Click Deploy

**Expected body shape:**
```json
{
  "sourceApplication": { "applicationName": "...", "enabled": true, "..." : "..." },
  "workflow": { "pluginList": [...], "uiMapList": [...] }
}
```

---

### TC-DEPLOY-ONLINE-03: executionName used as applicationName query param

**Steps:**
1. Open Deploy modal, change Execution Application Name to `my-execution`
2. Click Deploy

**Expected:** Request URL contains `applicationName=my-execution`

---

### TC-DEPLOY-ONLINE-04: Source application name is read-only

**Steps:**
1. Open Deploy modal for any application

**Expected:** Source Application field is a non-editable display element, not an input

---

### TC-DEPLOY-ONLINE-05: Success state shown after successful deploy

**Steps:**
1. Mock `/api/proxy/online/workflow` to return 200
2. Click Deploy

**Expected:**
- Status section shows `✓ Deployment submitted successfully`
- Deploy button becomes disabled
- Cancel button label changes to Close

---

### TC-DEPLOY-ONLINE-06: Error state shown on failure

**Steps:**
1. Mock `/api/proxy/online/workflow` to return 500
2. Click Deploy

**Expected:**
- Status section shows `✕ Deployment failed`
- Error message text shown below
- Deploy button re-enabled (can retry)

---

### TC-DEPLOY-ONLINE-07: Empty execution name blocked

**Steps:**
1. Clear the Execution Application Name field
2. Click Deploy

**Expected:** Toast error `Please enter an execution application name`, no API call made

---

### TC-DEPLOY-ONLINE-08: Modal resets between applications

**Steps:**
1. Deploy app A (reaches success state)
2. Click Close
3. Open Deploy modal for app B

**Expected:**
- Execution name pre-filled with app B's application name
- Status panel not shown (idle state)
- No leftover error message from previous deployment
