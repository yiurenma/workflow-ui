# Test Doc v45.0 — Deploy Rewrite: Online API Integration

**Version:** 45.0  
**Date:** 2026-04-21

## Test Cases

| ID | Description | Type | Expected Result |
|----|-------------|------|-----------------|
| TC-DEPLOY-ONLINE-01 | Deploy button visible in table Actions column | UI | Button visible |
| TC-DEPLOY-ONLINE-02 | Deploy modal opens with title "Deploy to Online" | UI | Modal title correct |
| TC-DEPLOY-ONLINE-03 | Execution name pre-filled from source app | UI | Input not empty |
| TC-DEPLOY-ONLINE-04 | Source Application shown as read-only display | UI | Label visible |
| TC-DEPLOY-ONLINE-05 | Payload Summary panel shows Block A and Block B | UI | Both blocks visible |
| TC-DEPLOY-ONLINE-06 | Deploy calls online API; body has applicationSettings + workflow | API | URL has applicationName param; body structure correct |
| TC-DEPLOY-ONLINE-07 | Cancel button closes modal without API call | UI | Modal hidden, no API called |

## Regression Scope

All existing TC-APP-DESK-01 through TC-APP-DESK-10 unchanged — Deploy button trigger in table is same position.

## Out of Scope

Actual deploy workflow execution on the online API side (handled by separate task `TODO-deploy-workflow-online-api-steps`).
