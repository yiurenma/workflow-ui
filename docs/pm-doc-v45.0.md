# PM Doc v45.0 — Deploy Rewrite: Online API Integration

**Label:** `TODO-deploy-rewrite-online-api-workflow-json`  
**Date:** 2026-04-22  
**Status:** DONE

## Summary

Rewrote the Deploy modal to call the Online API directly instead of the previous three-step remote operation API sequence (CreateApplicationName → UpdateApplicationName → SaveWorkflow).

## User Story

As a workflow developer, when I click Deploy on an application in the Hub, I want the system to automatically submit the source application info and workflow JSON to the Online API so that a deployment workflow can execute the actual deployment to the target environment.

## Key Changes

### Removed
- 3-step remote operation API deployment (POST entity-setting → PATCH entity-setting → POST workflow)
- Manual entry of: Deploy URL, Username, Password, Environment

### Added
- Single Online API call via local proxy: `POST /api/proxy/online/workflow?applicationName={executionName}&confirmationNumber={uuid}`
- Request body contains two required blocks:
  - **Part A — sourceApplication**: Full entity settings of the source application from Hub
  - **Part B — workflow**: Full workflow JSON of the source application from Hub
- Source Application name shown as read-only (origin, cannot be edited)
- Execution Application Name input (user-entered, used as runtime `applicationName` query param)
- Auto-generated `confirmationNumber` (UUID) per deploy request via `crypto.randomUUID()`
- Simplified single-step status display: idle → in-progress → success / error

## Acceptance Criteria

- AC1: Clicking Deploy calls Online API, not remote operation API
- AC2: The `applicationName` query param = user-entered execution name
- AC3: Body contains both `sourceApplication` (entity settings) and `workflow` (workflow JSON)
- AC4: Source application name is shown read-only in the modal
- AC5: Status display shows a single step (not 3 steps)
- AC6: Success message shown after successful submission
- AC7: Error message displayed when Online API returns error
- AC8: Modal state resets when opened for a different application
